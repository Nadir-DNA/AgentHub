// Pont typé vers le cœur Rust (Tauri `invoke`).
// Toute la logique métier (LLM, persistance, agents) vit côté Rust.

import { invoke } from '@tauri-apps/api/core'

export interface Trigger {
  id: string
  label: string
  cron: string
  prompt: string
  enabled: boolean
}

export interface Agent {
  id: string
  name: string
  role: string
  title: string
  system_prompt: string
  tools: string[]
  triggers: Trigger[]
  pack: string | null
  enabled: boolean
}

export interface Message {
  id: string
  agent_id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface AppConfig {
  metier: string | null
  model: string
  user_name: string | null
  user_email: string | null
  installed: boolean
  has_api_key: boolean
}

export interface PackInfo {
  id: string
  label: string
  icon: string
  description: string
  agent_count: number
}

// --- Packs métier ---
export const listPacks = () => invoke<PackInfo[]>('list_packs')
export const applyPack = (metier: string) => invoke<Agent[]>('apply_pack', { metier })

// --- Config ---
export const getConfig = () => invoke<AppConfig>('get_config')
export const saveConfig = (config: AppConfig) => invoke<void>('save_config', { config })

// --- Clé API (jamais relue côté front, seul le booléen est exposé) ---
export const setApiKey = (key: string) => invoke<void>('set_api_key', { key })
export const clearApiKey = () => invoke<void>('clear_api_key')
// ponytail: hasApiKey, clearHistory, isTauri removed — never imported anywhere

// --- Agents ---
export const listAgents = () => invoke<Agent[]>('list_agents')
export const getAgent = (id: string) => invoke<Agent | null>('get_agent', { id })
export const saveAgent = (agent: Agent) => invoke<void>('save_agent', { agent })
export const deleteAgent = (id: string) => invoke<void>('delete_agent', { id })

// --- Chat ---
export const sendMessage = (agentId: string, content: string) =>
  invoke<Message>('send_message', { agentId, content })
export const getHistory = (agentId: string) =>
  invoke<Message[]>('get_history', { agentId })

// --- Orchestrateur ---
export interface AskHubResponse {
  agent_id: string
  agent_name: string
  message: Message
}
export const askHub = (content: string) => invoke<AskHubResponse>('ask_hub', { content })

// --- Usage ---
export const getUsage = () => invoke<number>('get_usage')