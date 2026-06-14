//! Scheduler de tâches planifiées (crons des agents).
//!
//! Au démarrage, on lit les triggers actifs de chaque agent et on programme un
//! job par trigger. À l'échéance, le job exécute la demande via le moteur LLM
//! (réutilise [`crate::commands::agent_turn`]) et émet l'événement
//! `agent-task-done` vers l'UI.
//!
//! Limite v1 : les jobs sont fixés au lancement. Un changement de trigger est
//! pris en compte au prochain redémarrage de l'app.

use crate::commands::agent_turn;
use crate::db;
use crate::state::AppState;
use tauri::{AppHandle, Emitter, Manager};
use tokio_cron_scheduler::{Job, JobScheduler};

/// (agent_id, expression cron, prompt)
type TriggerJob = (String, String, String);

fn collect_triggers(app: &AppHandle) -> Vec<TriggerJob> {
    let state = app.state::<AppState>();
    let conn = match state.db.lock() {
        Ok(c) => c,
        Err(_) => return Vec::new(),
    };
    let agents = db::list_agents(&conn).unwrap_or_default();
    let mut jobs = Vec::new();
    for a in agents {
        for t in a.triggers {
            if t.enabled && !t.prompt.trim().is_empty() {
                jobs.push((a.id.clone(), t.cron.clone(), t.prompt.clone()));
            }
        }
    }
    jobs
}

/// Démarre le scheduler (à appeler dans une tâche async au setup).
pub async fn start(app: AppHandle) -> anyhow::Result<()> {
    let sched = JobScheduler::new().await?;

    for (agent_id, cron, prompt) in collect_triggers(&app) {
        let app_job = app.clone();
        let result = Job::new_async(cron.as_str(), move |_uuid, _lock| {
            let app_run = app_job.clone();
            let agent_id = agent_id.clone();
            let prompt = prompt.clone();
            Box::pin(async move {
                let state = app_run.state::<AppState>();
                match agent_turn(state.inner(), &agent_id, prompt).await {
                    Ok(msg) => {
                        let _ = app_run.emit(
                            "agent-task-done",
                            serde_json::json!({ "agent_id": agent_id, "content": msg.content }),
                        );
                    }
                    Err(e) => log::warn!("Trigger de l'agent {agent_id} échoué : {e}"),
                }
            })
        });

        match result {
            Ok(job) => {
                if let Err(e) = sched.add(job).await {
                    log::warn!("Ajout du job échoué : {e}");
                }
            }
            Err(e) => log::warn!("Expression cron invalide « {cron} » : {e}"),
        }
    }

    sched.start().await?;
    // Le scheduler doit vivre toute la durée de l'app.
    std::mem::forget(sched);
    Ok(())
}
