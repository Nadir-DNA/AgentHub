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

// --- Config ---
export const getConfig = () => invoke<AppConfig>('get_config')
export const saveConfig = (config: AppConfig) => invoke<void>('save_config', { config })

// --- Clé API (jamais relue côté front, seul le booléen est exposé) ---
export const setApiKey = (key: string) => invoke<void>('set_api_key', { key })
export const clearApiKey = () => invoke<void>('clear_api_key')
export const hasApiKey = () => invoke<boolean>('has_api_key')

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
export const clearHistory = (agentId: string) =>
  invoke<void>('clear_history', { agentId })

// --- Usage ---
export const getUsage = () => invoke<number>('get_usage')

/** True si l'app tourne dans le runtime Tauri (et non un simple navigateur). */
export const isTauri = (): boolean =>
  typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
