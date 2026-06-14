//! Agents par défaut (noyau universel).
//!
//! Lot 2 : seed minimal pour que le chat soit fonctionnel hors pack.
//! Lot 3 : les packs métier (agents/packs) enrichiront/spécialiseront ces agents.

use crate::db;
use crate::models::{Agent, Trigger};
use rusqlite::Connection;

fn agent(
    id: &str,
    name: &str,
    role: &str,
    title: &str,
    prompt: &str,
    tools: &[&str],
) -> Agent {
    Agent {
        id: id.into(),
        name: name.into(),
        role: role.into(),
        title: title.into(),
        system_prompt: prompt.into(),
        tools: tools.iter().map(|s| s.to_string()).collect(),
        triggers: Vec::new(),
        pack: None,
        enabled: true,
    }
}

/// Les 5 agents du noyau, communs à tous les métiers.
pub fn core_agents() -> Vec<Agent> {
    let base = "Tu es un assistant IA professionnel pour une TPE/PME française. \
Réponds en français, de façon concrète, brève et actionnable. \
Tu t'adresses à un dirigeant non technique : évite le jargon.";

    vec![
        agent(
            "manager", "Cap le Manager", "manager", "Manager",
            &format!("{base} Ton rôle : direction, stratégie, priorisation et aide à la décision. \
Tu synthétises, tu proposes des priorités claires et tu prépares des briefings courts."),
            &["google-agenda", "google-drive"],
        ),
        agent(
            "commercial", "Marc le Commercial", "commercial", "Commercial",
            &format!("{base} Ton rôle : prospection, suivi des deals, relances clients et préparation d'offres. \
Tu es orienté résultat et tu proposes toujours la prochaine action commerciale."),
            &["whatsapp", "google-agenda"],
        ),
        agent(
            "marketing", "Shadow le Marketing", "marketing", "Marketing",
            &format!("{base} Ton rôle : contenu, réseaux sociaux, visibilité en ligne et gestion des avis Google. \
Tu proposes des idées de posts et des réponses aux avis, dans un ton adapté au métier du client."),
            &["google-avis", "instagram"],
        ),
        agent(
            "judiciaire", "Claude le Juridique", "judiciaire", "Juridique",
            &format!("{base} Ton rôle : contrats, conformité, RGPD et CGV. \
Tu vulgarises le droit français, tu signales les risques et tu rappelles que tu ne remplaces pas un avocat."),
            &["yousign", "google-drive"],
        ),
        agent(
            "techdata", "Nova le Tech", "techdata", "Tech & Data",
            &format!("{base} Ton rôle : automatisation, analyse de données et intégration d'outils. \
Tu identifies les tâches automatisables et tu expliques simplement les gains."),
            &["google-drive"],
        ),
    ]
}

/// Insère les agents par défaut s'il n'y en a aucun en base.
pub fn seed_if_empty(conn: &Connection) -> db::Result<()> {
    if db::list_agents(conn)?.is_empty() {
        for a in core_agents() {
            db::upsert_agent(conn, &a)?;
        }
    }
    Ok(())
}

/// Démo de trigger par défaut (réutilisé en Lot 6 pour le scheduler).
#[allow(dead_code)]
pub fn sample_trigger() -> Trigger {
    Trigger {
        id: "relance-j1".into(),
        label: "Relance clients J-1".into(),
        cron: "0 0 9 * * *".into(),
        prompt: "Quels clients faut-il relancer aujourd'hui ?".into(),
        enabled: true,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn seed_inserts_five_then_idempotent() {
        let conn = Connection::open_in_memory().unwrap();
        db::init(&conn).unwrap();
        seed_if_empty(&conn).unwrap();
        assert_eq!(db::list_agents(&conn).unwrap().len(), 5);
        // idempotent : ne ré-insère pas
        seed_if_empty(&conn).unwrap();
        assert_eq!(db::list_agents(&conn).unwrap().len(), 5);
    }

    #[test]
    fn core_agents_have_prompts_and_ids() {
        for a in core_agents() {
            assert!(!a.id.is_empty());
            assert!(a.system_prompt.len() > 30);
            assert!(a.enabled);
        }
    }
}
