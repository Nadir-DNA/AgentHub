//! Persistance locale SQLite (rusqlite, bundled — aucune dépendance système).
//!
//! Schéma :
//! - `config`   : clé/valeur (config app sérialisée sous la clé « app »)
//! - `secrets`  : clé/valeur pour secrets gérés côté Rust (hors webview)
//! - `agents`   : un agent par ligne (data = JSON de [`Agent`])
//! - `messages` : historique de conversation
//! - `usage`    : compteur de requêtes IA par mois (YYYY-MM)

use crate::models::{Agent, AppConfig, Message};
use rusqlite::{params, Connection};

pub type Result<T> = std::result::Result<T, rusqlite::Error>;

/// Crée les tables si absentes.
pub fn init(conn: &Connection) -> Result<()> {
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS config (
            key   TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS secrets (
            key   TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS agents (
            id         TEXT PRIMARY KEY,
            data       TEXT NOT NULL,
            enabled    INTEGER NOT NULL DEFAULT 1,
            updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS messages (
            id        TEXT PRIMARY KEY,
            agent_id  TEXT NOT NULL,
            role      TEXT NOT NULL,
            content   TEXT NOT NULL,
            timestamp TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_messages_agent ON messages(agent_id);
        CREATE TABLE IF NOT EXISTS usage (
            month TEXT PRIMARY KEY,
            count INTEGER NOT NULL DEFAULT 0
        );
        ",
    )?;
    Ok(())
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

pub fn get_config(conn: &Connection) -> Result<AppConfig> {
    let raw: Option<String> = conn
        .query_row(
            "SELECT value FROM config WHERE key = 'app'",
            [],
            |row| row.get(0),
        )
        .ok();
    match raw {
        Some(json) => Ok(serde_json::from_str(&json).unwrap_or_default()),
        None => Ok(AppConfig::default()),
    }
}

pub fn set_config(conn: &Connection, cfg: &AppConfig) -> Result<()> {
    let json = serde_json::to_string(cfg).expect("AppConfig serializable");
    conn.execute(
        "INSERT INTO config(key, value) VALUES('app', ?1)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        params![json],
    )?;
    Ok(())
}

// ---------------------------------------------------------------------------
// Secrets (gérés côté Rust, jamais exposés au webview en lecture)
// ---------------------------------------------------------------------------

pub fn set_secret(conn: &Connection, key: &str, value: &str) -> Result<()> {
    conn.execute(
        "INSERT INTO secrets(key, value) VALUES(?1, ?2)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        params![key, value],
    )?;
    Ok(())
}

pub fn get_secret(conn: &Connection, key: &str) -> Result<Option<String>> {
    let v: Option<String> = conn
        .query_row("SELECT value FROM secrets WHERE key = ?1", params![key], |r| {
            r.get(0)
        })
        .ok();
    Ok(v)
}

pub fn delete_secret(conn: &Connection, key: &str) -> Result<()> {
    conn.execute("DELETE FROM secrets WHERE key = ?1", params![key])?;
    Ok(())
}

// ---------------------------------------------------------------------------
// Agents
// ---------------------------------------------------------------------------

pub fn upsert_agent(conn: &Connection, agent: &Agent) -> Result<()> {
    let json = serde_json::to_string(agent).expect("Agent serializable");
    let now = chrono::Utc::now().to_rfc3339();
    conn.execute(
        "INSERT INTO agents(id, data, enabled, updated_at) VALUES(?1, ?2, ?3, ?4)
         ON CONFLICT(id) DO UPDATE SET data = excluded.data, enabled = excluded.enabled, updated_at = excluded.updated_at",
        params![agent.id, json, agent.enabled as i64, now],
    )?;
    Ok(())
}

pub fn list_agents(conn: &Connection) -> Result<Vec<Agent>> {
    let mut stmt = conn.prepare("SELECT data FROM agents ORDER BY updated_at ASC")?;
    let rows = stmt.query_map([], |row| {
        let json: String = row.get(0)?;
        Ok(serde_json::from_str::<Agent>(&json))
    })?;
    let mut agents = Vec::new();
    for r in rows {
        if let Ok(agent) = r? {
            agents.push(agent);
        }
    }
    Ok(agents)
}

pub fn get_agent(conn: &Connection, id: &str) -> Result<Option<Agent>> {
    let raw: Option<String> = conn
        .query_row("SELECT data FROM agents WHERE id = ?1", params![id], |r| {
            r.get(0)
        })
        .ok();
    Ok(raw.and_then(|j| serde_json::from_str::<Agent>(&j).ok()))
}

pub fn delete_agent(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM agents WHERE id = ?1", params![id])?;
    conn.execute("DELETE FROM messages WHERE agent_id = ?1", params![id])?;
    Ok(())
}

/// Supprime tous les agents (utilisé par apply_pack pour repartir propre, Lot 3).
pub fn clear_agents(conn: &Connection) -> Result<()> {
    conn.execute("DELETE FROM agents", [])?;
    Ok(())
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

pub fn add_message(conn: &Connection, msg: &Message) -> Result<()> {
    conn.execute(
        "INSERT INTO messages(id, agent_id, role, content, timestamp) VALUES(?1, ?2, ?3, ?4, ?5)",
        params![msg.id, msg.agent_id, msg.role, msg.content, msg.timestamp],
    )?;
    Ok(())
}

pub fn get_messages(conn: &Connection, agent_id: &str) -> Result<Vec<Message>> {
    let mut stmt = conn.prepare(
        "SELECT id, agent_id, role, content, timestamp FROM messages WHERE agent_id = ?1 ORDER BY timestamp ASC",
    )?;
    let rows = stmt.query_map(params![agent_id], |row| {
        Ok(Message {
            id: row.get(0)?,
            agent_id: row.get(1)?,
            role: row.get(2)?,
            content: row.get(3)?,
            timestamp: row.get(4)?,
        })
    })?;
    rows.collect()
}

pub fn clear_messages(conn: &Connection, agent_id: &str) -> Result<()> {
    conn.execute("DELETE FROM messages WHERE agent_id = ?1", params![agent_id])?;
    Ok(())
}

// ---------------------------------------------------------------------------
// Usage
// ---------------------------------------------------------------------------

/// Incrémente le compteur de requêtes du mois courant et renvoie le nouveau total.
pub fn incr_usage(conn: &Connection) -> Result<i64> {
    let month = chrono::Utc::now().format("%Y-%m").to_string();
    conn.execute(
        "INSERT INTO usage(month, count) VALUES(?1, 1)
         ON CONFLICT(month) DO UPDATE SET count = count + 1",
        params![month],
    )?;
    let total: i64 = conn.query_row(
        "SELECT count FROM usage WHERE month = ?1",
        params![month],
        |r| r.get(0),
    )?;
    Ok(total)
}

pub fn get_usage(conn: &Connection) -> Result<i64> {
    let month = chrono::Utc::now().format("%Y-%m").to_string();
    let total: i64 = conn
        .query_row(
            "SELECT count FROM usage WHERE month = ?1",
            params![month],
            |r| r.get(0),
        )
        .unwrap_or(0);
    Ok(total)
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::{Agent, AppConfig, Message};

    fn mem() -> Connection {
        let conn = Connection::open_in_memory().unwrap();
        init(&conn).unwrap();
        conn
    }

    fn sample_agent(id: &str) -> Agent {
        Agent {
            id: id.into(),
            name: "Cap le Manager".into(),
            role: "manager".into(),
            title: "Manager".into(),
            system_prompt: "Tu es un manager.".into(),
            tools: vec!["google-agenda".into()],
            triggers: vec![],
            pack: Some("salon".into()),
            enabled: true,
        }
    }

    #[test]
    fn config_roundtrip() {
        let conn = mem();
        assert_eq!(get_config(&conn).unwrap().installed, false);
        let mut cfg = AppConfig::default();
        cfg.installed = true;
        cfg.metier = Some("salon".into());
        set_config(&conn, &cfg).unwrap();
        let got = get_config(&conn).unwrap();
        assert!(got.installed);
        assert_eq!(got.metier.as_deref(), Some("salon"));
    }

    #[test]
    fn agent_crud() {
        let conn = mem();
        upsert_agent(&conn, &sample_agent("manager")).unwrap();
        upsert_agent(&conn, &sample_agent("commercial")).unwrap();
        assert_eq!(list_agents(&conn).unwrap().len(), 2);

        let mut a = get_agent(&conn, "manager").unwrap().unwrap();
        a.name = "Renommé".into();
        upsert_agent(&conn, &a).unwrap();
        assert_eq!(get_agent(&conn, "manager").unwrap().unwrap().name, "Renommé");

        delete_agent(&conn, "manager").unwrap();
        assert!(get_agent(&conn, "manager").unwrap().is_none());
        assert_eq!(list_agents(&conn).unwrap().len(), 1);
    }

    #[test]
    fn messages_and_clear() {
        let conn = mem();
        for i in 0..3 {
            add_message(
                &conn,
                &Message {
                    id: format!("m{i}"),
                    agent_id: "manager".into(),
                    role: if i % 2 == 0 { "user" } else { "assistant" }.into(),
                    content: format!("msg {i}"),
                    timestamp: format!("2026-06-14T10:0{i}:00Z"),
                },
            )
            .unwrap();
        }
        assert_eq!(get_messages(&conn, "manager").unwrap().len(), 3);
        clear_messages(&conn, "manager").unwrap();
        assert_eq!(get_messages(&conn, "manager").unwrap().len(), 0);
    }

    #[test]
    fn secrets_roundtrip() {
        let conn = mem();
        assert!(get_secret(&conn, "api_key").unwrap().is_none());
        set_secret(&conn, "api_key", "sk-test-123").unwrap();
        assert_eq!(get_secret(&conn, "api_key").unwrap().as_deref(), Some("sk-test-123"));
        delete_secret(&conn, "api_key").unwrap();
        assert!(get_secret(&conn, "api_key").unwrap().is_none());
    }

    #[test]
    fn usage_increments() {
        let conn = mem();
        assert_eq!(get_usage(&conn).unwrap(), 0);
        assert_eq!(incr_usage(&conn).unwrap(), 1);
        assert_eq!(incr_usage(&conn).unwrap(), 2);
        assert_eq!(get_usage(&conn).unwrap(), 2);
    }
}
