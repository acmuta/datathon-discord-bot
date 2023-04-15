import { BotClient } from '../types'

export type OnDiscordEvent = (client: BotClient) => void
export * from './interactionCreate.js'
export * from './ready.js'
