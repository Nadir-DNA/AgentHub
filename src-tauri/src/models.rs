//! Modèles de données partagés entre le cœur Rust et l'UI (serde).

use serde::{Deserialize, Serialize};

/// Un déclencheur planifié (cron) attaché à un agent.
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct Trigger {
    pub id: String,
    pub label: String,
    /// Expression cron (sec min hour day month weekday) — voir scheduler (Lot 6).
    pub cron: String,
    /// Le message envoyé à l'agent quand le trigger se déclenche.
    pub prompt: String,
    pub enabled: bool,
}

/// Un agent métier configurable.
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct Agent {
    /// Identifiant stable (slug ou uuid).
    pub id: String,
    /// Nom affiché, personnalisable (ex. « Cap le Manager »).
    pub name: String,
    /// Type/rôle métier : manager, commercial, marketing, judiciaire, techdata, custom.
    pub role: String,
    /// Titre court affiché (ex. « Manager »).
    pub title: String,
    /// Prompt système pilotant le comportement de l'agent.
    pub system_prompt: String,
    /// Outils activés (déclaratif en v1 : whatsapp, google-agenda, qonto…).
    pub tools: Vec<String>,
    /// Déclencheurs planifiés.
    pub triggers: Vec<Trigger>,
    /// Pack métier d'origine (None si agent custom).
    pub pack: Option<String>,
    pub enabled: bool,
}

/// Un message de conversation.
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct Message {
    pub id: String,
    pub agent_id: String,
    /// « user » ou « assistant ».
    pub role: String,
    pub content: String,
    /// Horodatage ISO-8601.
    pub timestamp: String,
}

/// Configuration applicative (hors secrets — la clé API vit dans le SecretStore).
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AppConfig {
    /// Métier choisi à l'onboarding (None si pas encore configuré).
    pub metier: Option<String>,
    /// Modèle LLM sélectionné.
    pub model: String,
    pub user_name: Option<String>,
    pub user_email: Option<String>,
    /// True une fois l'onboarding terminé.
    pub installed: bool,
    /// Dérivé : true si une clé API est présente dans le SecretStore.
    /// (Non persisté en base — recalculé à la lecture.)
    #[serde(default)]
    pub has_api_key: bool,
}

/// Un pack métier : une équipe d'agents pré-configurée pour un secteur.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Pack {
    pub id: String,
    pub label: String,
    pub icon: String,
    pub description: String,
    pub agents: Vec<Agent>,
}

/// Vue allégée d'un pack pour l'UI (sans le détail des agents).
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct PackInfo {
    pub id: String,
    pub label: String,
    pub icon: String,
    pub description: String,
    pub agent_count: usize,
}

impl From<&Pack> for PackInfo {
    fn from(p: &Pack) -> Self {
        PackInfo {
            id: p.id.clone(),
            label: p.label.clone(),
            icon: p.icon.clone(),
            description: p.description.clone(),
            agent_count: p.agents.len(),
        }
    }
}

impl Default for AppConfig {
    fn default() -> Self {
        AppConfig {
            metier: None,
            model: "deepseek-v4-flash".to_string(),
            user_name: None,
            user_email: None,
            installed: false,
            has_api_key: false,
        }
    }
}
