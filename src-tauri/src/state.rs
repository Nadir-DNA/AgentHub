//! État applicatif partagé, géré par Tauri (`app.manage`).

use rusqlite::Connection;
use std::sync::Mutex;

pub struct AppState {
    /// Connexion SQLite locale (sérialisée par un Mutex — usage mono-process).
    pub db: Mutex<Connection>,
}

impl AppState {
    pub fn new(conn: Connection) -> Self {
        AppState {
            db: Mutex::new(conn),
        }
    }
}
