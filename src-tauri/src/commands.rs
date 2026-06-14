//! Commandes Tauri exposées au frontend (`invoke`).
//!
//! Toutes renvoient `Result<_, String>` — l'erreur est affichée côté UI.

use crate::models::{Agent, AppConfig};
use crate::state::AppState;
use crate::{db, store};
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
// Usage
// ---------------------------------------------------------------------------

#[tauri::command]
pub fn get_usage(state: State<AppState>) -> CmdResult<i64> {
    let conn = state.db.lock().map_err(map)?;
    db::get_usage(&conn).map_err(map)
}
