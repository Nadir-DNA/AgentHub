//! Commandes Tauri exposées au frontend (`invoke`).
//!
//! Toutes renvoient `Result<_, String>` — l'erreur est affichée côté UI.

use crate::models::{Agent, AppConfig, AskHubResponse, Message, PackInfo};
use crate::state::AppState;
use crate::{db, llm, orchestrator, packs, store};
use tauri::State;

type CmdResult<T> = Result<T, String>;

fn map<E: std::fmt::Display>(e: E) -> String {
    e.to_string()
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

#[tauri::command]
pub fn get_config(state: State<AppState>) -> CmdResult<AppConfig> {
    let conn = state.db.lock().map_err(map)?;
    let mut cfg = db::get_config(&conn).map_err(map)?;
    cfg.has_api_key = store::has_api_key(&conn);
    Ok(cfg)
}

#[tauri::command]
pub fn save_config(state: State<AppState>, config: AppConfig) -> CmdResult<()> {
    let conn = state.db.lock().map_err(map)?;
    db::set_config(&conn, &config).map_err(map)
}

// ---------------------------------------------------------------------------
// Clé API (jamais relue côté frontend — seul `has_api_key` est exposé)
// ---------------------------------------------------------------------------

#[tauri::command]
pub fn set_api_key(state: State<AppState>, key: String) -> CmdResult<()> {
    let conn = state.db.lock().map_err(map)?;
    store::set_api_key(&conn, &key).map_err(map)
}

#[tauri::command]
pub fn clear_api_key(state: State<AppState>) -> CmdResult<()> {
    let conn = state.db.lock().map_err(map)?;
    store::clear_api_key(&conn).map_err(map)
}

#[tauri::command]
pub fn has_api_key(state: State<AppState>) -> CmdResult<bool> {
    let conn = state.db.lock().map_err(map)?;
    Ok(store::has_api_key(&conn))
}

// ---------------------------------------------------------------------------
// Agents
// ---------------------------------------------------------------------------

#[tauri::command]
pub fn list_agents(state: State<AppState>) -> CmdResult<Vec<Agent>> {
    let conn = state.db.lock().map_err(map)?;
    db::list_agents(&conn).map_err(map)
}

#[tauri::command]
pub fn get_agent(state: State<AppState>, id: String) -> CmdResult<Option<Agent>> {
    let conn = state.db.lock().map_err(map)?;
    db::get_agent(&conn, &id).map_err(map)
}

#[tauri::command]
pub fn save_agent(state: State<AppState>, agent: Agent) -> CmdResult<()> {
    let conn = state.db.lock().map_err(map)?;
    db::upsert_agent(&conn, &agent).map_err(map)
}

#[tauri::command]
pub fn delete_agent(state: State<AppState>, id: String) -> CmdResult<()> {
    let conn = state.db.lock().map_err(map)?;
    db::delete_agent(&conn, &id).map_err(map)
}

// ---------------------------------------------------------------------------
// Packs métier
// ---------------------------------------------------------------------------

#[tauri::command]
pub fn list_packs() -> CmdResult<Vec<PackInfo>> {
    Ok(packs::all_packs().iter().map(PackInfo::from).collect())
}

/// Applique un pack métier : remplace l'équipe d'agents et mémorise le métier.
#[tauri::command]
pub fn apply_pack(state: State<AppState>, metier: String) -> CmdResult<Vec<Agent>> {
    let conn = state.db.lock().map_err(map)?;
    packs::apply(&conn, &metier).map_err(map)
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

fn now_iso() -> String {
    chrono::Utc::now().to_rfc3339()
}

fn new_id() -> String {
    uuid::Uuid::new_v4().to_string()
}

/// Cœur d'un tour de conversation, réutilisé par `send_message` et `ask_hub`.
/// Persiste le message user, appelle le LLM, persiste la réponse + usage.
/// Le MutexGuard est toujours libéré avant le `await` (future Send-safe).
async fn agent_turn(state: &AppState, agent_id: &str, content: String) -> CmdResult<Message> {
    // Phase 1 (sync) : lecture + persistance du message user.
    let (api_key, model, turns) = {
        let conn = state.db.lock().map_err(map)?;
        let agent = db::get_agent(&conn, agent_id)
            .map_err(map)?
            .ok_or_else(|| format!("Agent « {agent_id} » introuvable"))?;
        let api_key = store::get_api_key(&conn)
            .map_err(map)?
            .ok_or_else(|| "NO_API_KEY".to_string())?;
        let cfg = db::get_config(&conn).map_err(map)?;
        let history = db::get_messages(&conn, agent_id).map_err(map)?;

        let user_msg = Message {
            id: new_id(),
            agent_id: agent_id.to_string(),
            role: "user".into(),
            content: content.clone(),
            timestamp: now_iso(),
        };
        db::add_message(&conn, &user_msg).map_err(map)?;

        let mut turns = vec![llm::ChatTurn::system(agent.system_prompt)];
        for m in &history {
            turns.push(llm::ChatTurn { role: m.role.clone(), content: m.content.clone() });
        }
        turns.push(llm::ChatTurn::user(content));
        (api_key, cfg.model, turns)
    };

    // Phase 2 (async) : appel réseau au LLM.
    let reply = llm::complete(&api_key, &model, &turns)
        .await
        .map_err(|e| e.to_string())?;

    // Phase 3 (sync) : persistance de la réponse + usage.
    let assistant = Message {
        id: new_id(),
        agent_id: agent_id.to_string(),
        role: "assistant".into(),
        content: reply,
        timestamp: now_iso(),
    };
    {
        let conn = state.db.lock().map_err(map)?;
        db::add_message(&conn, &assistant).map_err(map)?;
        db::incr_usage(&conn).map_err(map)?;
    }
    Ok(assistant)
}

/// Envoie un message à un agent précis.
#[tauri::command]
pub async fn send_message(
    state: State<'_, AppState>,
    agent_id: String,
    content: String,
) -> CmdResult<Message> {
    agent_turn(state.inner(), &agent_id, content).await
}

/// Orchestrateur : route la demande vers l'agent le plus pertinent et répond.
#[tauri::command]
pub async fn ask_hub(state: State<'_, AppState>, content: String) -> CmdResult<AskHubResponse> {
    let (agent_id, agent_name) = {
        let conn = state.db.lock().map_err(map)?;
        let agents = db::list_agents(&conn).map_err(map)?;
        let id = orchestrator::route(&agents, &content);
        let name = agents
            .iter()
            .find(|a| a.id == id)
            .map(|a| a.name.clone())
            .unwrap_or_else(|| id.clone());
        (id, name)
    };
    let message = agent_turn(state.inner(), &agent_id, content).await?;
    Ok(AskHubResponse { agent_id, agent_name, message })
}

#[tauri::command]
pub fn get_history(state: State<AppState>, agent_id: String) -> CmdResult<Vec<Message>> {
    let conn = state.db.lock().map_err(map)?;
    db::get_messages(&conn, &agent_id).map_err(map)
}

#[tauri::command]
pub fn clear_history(state: State<AppState>, agent_id: String) -> CmdResult<()> {
    let conn = state.db.lock().map_err(map)?;
    db::clear_messages(&conn, &agent_id).map_err(map)
}

// ---------------------------------------------------------------------------
// Usage
// ---------------------------------------------------------------------------

#[tauri::command]
pub fn get_usage(state: State<AppState>) -> CmdResult<i64> {
    let conn = state.db.lock().map_err(map)?;
    db::get_usage(&conn).map_err(map)
}
