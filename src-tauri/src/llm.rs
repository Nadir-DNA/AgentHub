//! Client LLM vers OpenCode Go (API OpenAI-compatible, BYOK).
//!
//! Endpoint : `https://opencode.ai/zen/go/v1/chat/completions`
//! Auth     : header `Authorization: Bearer <clé du client>`
//! Modèles  : deepseek-v4-flash (défaut), glm-5.1, kimi-k2.7, mimo-v2.5…

use serde::{Deserialize, Serialize};

const ENDPOINT: &str = "https://opencode.ai/zen/go/v1/chat/completions";
const TIMEOUT_SECS: u64 = 90;

#[derive(Debug, thiserror::Error)]
pub enum LlmError {
    #[error("Clé API invalide ou expirée. Vérifiez votre clé OpenCode Go.")]
    Unauthorized,
    #[error("Quota atteint ou trop de requêtes. Réessayez dans un instant.")]
    RateLimited,
    #[error("Erreur du service IA ({0}) : {1}")]
    Api(u16, String),
    #[error("Problème réseau : {0}")]
    Network(String),
    #[error("Réponse IA inattendue : {0}")]
    Parse(String),
}

/// Un tour de conversation au format API.
#[derive(Serialize, Clone, Debug)]
pub struct ChatTurn {
    pub role: String,
    pub content: String,
}

impl ChatTurn {
    pub fn system(content: impl Into<String>) -> Self {
        ChatTurn { role: "system".into(), content: content.into() }
    }
    pub fn user(content: impl Into<String>) -> Self {
        ChatTurn { role: "user".into(), content: content.into() }
    }
}

#[derive(Serialize)]
struct ChatRequest<'a> {
    model: &'a str,
    messages: &'a [ChatTurn],
    temperature: f32,
}

#[derive(Deserialize)]
struct ChatResponse {
    choices: Vec<Choice>,
}

#[derive(Deserialize)]
struct Choice {
    message: ResponseMessage,
}

#[derive(Deserialize)]
struct ResponseMessage {
    content: String,
}

/// Envoie une complétion et renvoie le texte de la réponse de l'assistant.
pub async fn complete(api_key: &str, model: &str, turns: &[ChatTurn]) -> Result<String, LlmError> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(TIMEOUT_SECS))
        .build()
        .map_err(|e| LlmError::Network(e.to_string()))?;

    let body = ChatRequest { model, messages: turns, temperature: 0.4 };

    let resp = client
        .post(ENDPOINT)
        .bearer_auth(api_key)
        .json(&body)
        .send()
        .await
        .map_err(|e| LlmError::Network(e.to_string()))?;

    let status = resp.status();
    if !status.is_success() {
        let code = status.as_u16();
        let detail = resp.text().await.unwrap_or_default();
        return Err(match code {
            401 | 403 => LlmError::Unauthorized,
            429 => LlmError::RateLimited,
            _ => LlmError::Api(code, truncate(&detail, 300)),
        });
    }

    let parsed: ChatResponse = resp
        .json()
        .await
        .map_err(|e| LlmError::Parse(e.to_string()))?;

    parsed
        .choices
        .into_iter()
        .next()
        .map(|c| c.message.content)
        .ok_or_else(|| LlmError::Parse("aucune réponse dans choices[]".into()))
}

fn truncate(s: &str, max: usize) -> String {
    if s.len() <= max {
        s.to_string()
    } else {
        format!("{}…", &s[..max])
    }
}
