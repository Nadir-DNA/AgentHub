mod agents;
mod commands;
mod db;
mod llm;
mod models;
mod orchestrator;
mod packs;
mod scheduler;
mod state;
mod store;

use rusqlite::Connection;
use state::AppState;
use tauri::Manager;

/// Ouvre (ou crée) la base SQLite dans le répertoire de données de l'app.
fn open_db(app: &tauri::App) -> Connection {
    let dir = app
        .path()
        .app_data_dir()
        .expect("app_data_dir indisponible");
    std::fs::create_dir_all(&dir).expect("création du répertoire de données");
    let conn = Connection::open(dir.join("agenthub.db")).expect("ouverture SQLite");
    db::init(&conn).expect("init schéma SQLite");
    agents::seed_if_empty(&conn).expect("seed agents par défaut");
    conn
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            let conn = open_db(app);
            app.manage(AppState::new(conn));

            // Démarre le scheduler des tâches planifiées en arrière-plan.
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = scheduler::start(handle).await {
                    log::warn!("Scheduler non démarré : {e}");
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_config,
            commands::save_config,
            commands::set_api_key,
            commands::clear_api_key,
            commands::has_api_key,
            commands::list_agents,
            commands::get_agent,
            commands::save_agent,
            commands::delete_agent,
            commands::list_packs,
            commands::apply_pack,
            commands::send_message,
            commands::ask_hub,
            commands::get_history,
            commands::clear_history,
            commands::get_usage,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
