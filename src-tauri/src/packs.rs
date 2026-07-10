//! Packs métier : une équipe d'agents pré-configurée par secteur.
//!
//! Principe « Noyau + Pack » : on part des 5 agents du noyau ([`crate::agents::core_agents`])
//! et on les spécialise pour le métier (contexte injecté dans le prompt, outils, triggers).

use crate::agents::core_agents;
use crate::db;
use crate::models::{Agent, Pack, Trigger};
use rusqlite::Connection;

/// Spécification déclarative d'un pack.
struct PackSpec {
    id: &'static str,
    label: &'static str,
    icon: &'static str,
    description: &'static str,
    /// Contexte métier ajouté au prompt système de chaque agent.
    context: &'static str,
    /// Surcharge d'outils par rôle (role, outils).
    tools: &'static [(&'static str, &'static [&'static str])],
}

fn trigger(id: &str, label: &str, cron: &str, prompt: &str) -> Trigger {
    Trigger { id: id.into(), label: label.into(), cron: cron.into(), prompt: prompt.into(), enabled: true }
}

/// Triggers par défaut communs (relance le matin, bilan le soir).
fn default_triggers(role: &str) -> Vec<Trigger> {
    match role {
        "commercial" => vec![trigger(
            "relance-j1", "Relance clients J-1", "0 0 9 * * Mon-Fri",
            "Quels clients faut-il relancer aujourd'hui ?",
        )],
        "manager" => vec![trigger(
            "bilan-soir", "Bilan de la journée", "0 0 18 * * Mon-Fri",
            "Fais-moi le bilan de la journée.",
        )],
        _ => Vec::new(),
    }
}

const SPECS: &[PackSpec] = &[
    PackSpec {
        id: "salon",
        label: "Salon / Coiffure",
        icon: "💇",
        description: "Coiffure, esthétique, barbier — RDV, fidélisation, avis.",
        context: "Le client gère un salon de coiffure/esthétique. Pense planning de RDV, fidélisation, avis Google, no-show, vente de produits.",
        tools: &[("commercial", &["whatsapp", "planity"]), ("marketing", &["google-avis", "instagram"])],
    },
    PackSpec {
        id: "avocat",
        label: "Avocat / Juridique",
        icon: "⚖️",
        description: "Cabinet d'avocat — dossiers, RDV, conformité, facturation.",
        context: "Le client est un avocat ou juriste. Pense gestion de dossiers, confidentialité, RDV clients, déontologie, facturation d'honoraires.",
        tools: &[("judiciaire", &["yousign", "google-drive"]), ("commercial", &["whatsapp", "google-agenda"])], // ponytail: Doctolib removed, Whatsapp added
    },
    PackSpec {
        id: "garage",
        label: "Garage / Auto",
        icon: "🔧",
        description: "Garage, mécanique — devis, RDV, relances, fiches véhicule.",
        context: "Le client gère un garage automobile. Pense devis de réparation, RDV atelier, relances, fiches véhicule, avis clients.",
        tools: &[("commercial", &["whatsapp", "google-agenda"]), ("marketing", &["google-avis"])],
    },
    PackSpec {
        id: "restaurant",
        label: "Restaurant",
        icon: "🍽️",
        description: "Restauration — réservations, avis, réseaux, menus.",
        context: "Le client gère un restaurant. Pense réservations, gestion des avis, réseaux sociaux (photos de plats), menus et promotions.",
        tools: &[("marketing", &["google-avis", "instagram"]), ("commercial", &["whatsapp"])],
    },
    PackSpec {
        id: "medical",
        label: "Médical / Paramédical",
        icon: "🏥",
        description: "Praticien — RDV, rappels, dossiers, conformité.",
        context: "Le client est un praticien médical/paramédical. Pense RDV, rappels patients, confidentialité des données de santé, conformité.",
        tools: &[("commercial", &["doctolib", "google-agenda"]), ("judiciaire", &["google-drive"])],
    },
    PackSpec {
        id: "autre",
        label: "Auto-entrepreneur / Autre",
        icon: "💼",
        description: "Pack générique — équipe complète adaptable à tout métier.",
        context: "Le client est un auto-entrepreneur ou une TPE généraliste. Reste polyvalent et adapte-toi à son activité.",
        tools: &[],
    },
];

fn build_pack(spec: &PackSpec) -> Pack {
    let agents = core_agents()
        .into_iter()
        .map(|mut a| {
            // Contexte métier injecté dans le prompt.
            a.system_prompt = format!("{}\n\nContexte : {}", a.system_prompt, spec.context);
            // Surcharge d'outils si définie pour ce rôle.
            if let Some((_, tools)) = spec.tools.iter().find(|(role, _)| *role == a.role) {
                a.tools = tools.iter().map(|s| s.to_string()).collect();
            }
            a.triggers = default_triggers(&a.role);
            a.pack = Some(spec.id.to_string());
            a
        })
        .collect();

    Pack {
        id: spec.id.into(),
        label: spec.label.into(),
        icon: spec.icon.into(),
        description: spec.description.into(),
        agents,
    }
}

/// Tous les packs disponibles.
pub fn all_packs() -> Vec<Pack> {
    SPECS.iter().map(build_pack).collect()
}

/// Retrouve un pack par son id (None si inconnu).
pub fn find(id: &str) -> Option<Pack> {
    SPECS.iter().find(|s| s.id == id).map(build_pack)
}

/// Applique un pack : remplace les agents en base par ceux du pack et
/// mémorise le métier dans la config. Renvoie la nouvelle liste d'agents.
pub fn apply(conn: &Connection, metier: &str) -> db::Result<Vec<Agent>> {
    let pack = find(metier).unwrap_or_else(|| find("autre").expect("pack générique présent"));
    db::clear_agents(conn)?;
    for a in &pack.agents {
        db::upsert_agent(conn, a)?;
    }
    let mut cfg = db::get_config(conn)?;
    cfg.metier = Some(pack.id.clone());
    db::set_config(conn, &cfg)?;
    db::list_agents(conn)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn all_packs_well_formed() {
        let packs = all_packs();
        assert!(packs.len() >= 6);
        for p in &packs {
            assert_eq!(p.agents.len(), 5);
            assert!(p.agents.iter().all(|a| a.pack.as_deref() == Some(p.id.as_str())));
            assert!(p.agents.iter().all(|a| a.system_prompt.contains("Contexte :")));
        }
    }

    #[test]
    fn apply_replaces_agents_and_sets_metier() {
        let conn = Connection::open_in_memory().unwrap();
        db::init(&conn).unwrap();
        let agents = apply(&conn, "salon").unwrap();
        assert_eq!(agents.len(), 5);
        assert_eq!(db::get_config(&conn).unwrap().metier.as_deref(), Some("salon"));
        // le commercial du pack salon a Planity
        let commercial = db::get_agent(&conn, "commercial").unwrap().unwrap();
        assert!(commercial.tools.contains(&"planity".to_string()));
    }

    #[test]
    fn unknown_metier_falls_back_to_generic() {
        let conn = Connection::open_in_memory().unwrap();
        db::init(&conn).unwrap();
        apply(&conn, "metier-inexistant").unwrap();
        assert_eq!(db::get_config(&conn).unwrap().metier.as_deref(), Some("autre"));
    }
}
