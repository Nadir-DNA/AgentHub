//! État applicatif partagé, géré par Tauri (`app.manage`).

use rusqlite::Connection;
use std::sync::Mutex;

pub struct AppState {
    /// Connexion SQLite locale (sérialisée par un Mutex — usage mono-process).
    pub db: Mutex<Connection>,
    /// ponytail: reqwest::Client reused for connection pooling — was created per-call in llm.rs
    pub http: reqwest::Client,
}

impl AppState {
    pub fn new(conn: Connection) -> Self {
        let http = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(90))
            .build()
            .expect("reqwest client");
        AppState {
            db: Mutex::new(conn),
            http,
        }
    }
}