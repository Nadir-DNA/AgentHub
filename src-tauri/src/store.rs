//! SecretStore — stockage de la clé API **hors du webview**.
//!
//! Décision (rebuild v2) : la clé n'est plus dans `localStorage` (faille de
//! l'audit : exposée au JS/XSS). Elle est gérée côté Rust dans la table
//! `secrets` du SQLite local (fichier en app-data, permissions utilisateur OS),
//! et n'est jamais renvoyée telle quelle au frontend — seul un booléen
//! « présente / absente » est exposé.
//!
//! Durcissement prévu (Lot 7) : chiffrement au repos via le keychain OS
//! (crate `keyring` / Secret Service) quand disponible, avec repli sur ce store.

use crate::db;
use rusqlite::Connection;

const API_KEY: &str = "opencode_api_key";

pub fn set_api_key(conn: &Connection, key: &str) -> db::Result<()> {
    let trimmed = key.trim();
    if trimmed.is_empty() {
        return db::delete_secret(conn, API_KEY);
    }
    db::set_secret(conn, API_KEY, trimmed)
}

pub fn get_api_key(conn: &Connection) -> db::Result<Option<String>> {
    db::get_secret(conn, API_KEY)
}

pub fn has_api_key(conn: &Connection) -> bool {
    matches!(db::get_secret(conn, API_KEY), Ok(Some(ref k)) if !k.is_empty())
}

pub fn clear_api_key(conn: &Connection) -> db::Result<()> {
    db::delete_secret(conn, API_KEY)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn mem() -> Connection {
        let conn = Connection::open_in_memory().unwrap();
        db::init(&conn).unwrap();
        conn
    }

    #[test]
    fn api_key_lifecycle() {
        let conn = mem();
        assert!(!has_api_key(&conn));
        set_api_key(&conn, "  sk-abc  ").unwrap();
        assert!(has_api_key(&conn));
        assert_eq!(get_api_key(&conn).unwrap().as_deref(), Some("sk-abc"));
        // chaîne vide => suppression
        set_api_key(&conn, "   ").unwrap();
        assert!(!has_api_key(&conn));
    }
}
