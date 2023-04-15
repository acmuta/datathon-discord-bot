import {
	CommandInteraction,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder
} from 'discord.js'

import { BotClient } from '../types'

export type CommandRunFn = (client: BotClient, interaction: CommandInteraction) => Promise<void>
export interface Command {
	data:
		| SlashCommandBuilder
		| SlashCommandSubcommandsOnlyBuilder
		| Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
	run: CommandRunFn
}
