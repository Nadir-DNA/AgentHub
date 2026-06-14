//! Orchestrateur « Hub » : route une demande en langage naturel vers l'agent
//! métier le plus pertinent.
//!
//! v1 : classification par mots-clés (déterministe, rapide, testable), avec
//! repli sur le Manager (généraliste) en cas d'ambiguïté.
//! (Évolution possible : classification par LLM si aucun mot-clé ne matche.)

use crate::models::Agent;

/// Mots-clés associés à chaque rôle métier.
fn keywords(role: &str) -> &'static [&'static str] {
    match role {
        "commercial" => &[
            "prospect", "client", "relance", "relancer", "devis", "vente", "vendre",
            "deal", "offre", "rdv", "rendez-vous", "pipeline", "commercial",
        ],
        "marketing" => &[
            "post", "instagram", "avis", "réseaux", "reseaux", "contenu", "visibilité",
            "visibilite", "seo", "publication", "story", "marketing", "communication",
        ],
        "judiciaire" => &[
            "contrat", "rgpd", "cgv", "juridique", "conformité", "conformite", "clause",
            "mentions légales", "droit", "litige", "facture impayée",
        ],
        "techdata" => &[
            "automatiser", "automatisation", "données", "donnees", "data", "intégration",
            "integration", "rapport", "statistiques", "tech", "api", "tableau de bord",
        ],
        "manager" => &[
            "bilan", "stratégie", "strategie", "priorité", "priorite", "décision",
            "decision", "planning", "équipe", "equipe", "briefing", "objectif",
        ],
        _ => &[],
    }
}

/// Score d'un texte pour un rôle (nombre de mots-clés trouvés).
fn score(role: &str, lower: &str) -> usize {
    keywords(role).iter().filter(|k| lower.contains(*k)).count()
}

/// Choisit l'identifiant de l'agent le plus pertinent pour la demande.
/// Repli : Manager s'il existe, sinon le premier agent.
pub fn route(agents: &[Agent], content: &str) -> String {
    if agents.is_empty() {
        return "manager".to_string();
    }
    let lower = content.to_lowercase();

    let best = agents
        .iter()
        .map(|a| (a, score(&a.role, &lower)))
        .max_by_key(|(_, s)| *s);

    match best {
        Some((agent, s)) if s > 0 => agent.id.clone(),
        _ => agents
            .iter()
            .find(|a| a.role == "manager")
            .or_else(|| agents.first())
            .map(|a| a.id.clone())
            .unwrap_or_else(|| "manager".to_string()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn agent(id: &str, role: &str) -> Agent {
        Agent {
            id: id.into(),
            name: id.into(),
            role: role.into(),
            title: role.into(),
            system_prompt: String::new(),
            tools: vec![],
            triggers: vec![],
            pack: None,
            enabled: true,
        }
    }

    fn team() -> Vec<Agent> {
        vec![
            agent("manager", "manager"),
            agent("commercial", "commercial"),
            agent("marketing", "marketing"),
            agent("judiciaire", "judiciaire"),
            agent("techdata", "techdata"),
        ]
    }

    #[test]
    fn routes_to_commercial() {
        assert_eq!(route(&team(), "Quels clients faut-il relancer ?"), "commercial");
    }

    #[test]
    fn routes_to_marketing() {
        assert_eq!(route(&team(), "Propose-moi un post Instagram"), "marketing");
    }

    #[test]
    fn routes_to_judiciaire() {
        assert_eq!(route(&team(), "Mon contrat est-il conforme au RGPD ?"), "judiciaire");
    }

    #[test]
    fn routes_to_techdata() {
        assert_eq!(route(&team(), "Comment automatiser l'export de mes données ?"), "techdata");
    }

    #[test]
    fn falls_back_to_manager_when_ambiguous() {
        assert_eq!(route(&team(), "Bonjour, ça va ?"), "manager");
    }

    #[test]
    fn falls_back_to_first_when_no_manager() {
        let agents = vec![agent("c1", "commercial"), agent("m1", "marketing")];
        assert_eq!(route(&agents, "blabla"), "c1");
    }
}
