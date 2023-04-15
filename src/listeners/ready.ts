import { Events, RESTPostAPIApplicationCommandsJSONBody, Routes } from 'discord.js'
import { OnDiscordEvent } from '.'
import { CommandRegistry } from './../commands/CommandRegistry'
import { BotClient } from '../types'

export const onReady: OnDiscordEvent = (client: BotClient): void => {
	const discordClient = client.discord;
	discordClient.once(Events.ClientReady, async () => {
		if (!discordClient.user || !discordClient.application) {
			return
		}

		const commandJson: RESTPostAPIApplicationCommandsJSONBody[] = [];
		CommandRegistry.forEach((command) => {
			commandJson.push(command.data.toJSON())
		})

		await discordClient.rest.put(
			Routes.applicationGuildCommands(discordClient.user.id, client.config.guild),
			{
				body: commandJson satisfies RESTPostAPIApplicationCommandsJSONBody[],
			},
		)
		// await discordClient.application.commands.set(commandJson)
		console.log(`${discordClient.user.username} (${discordClient.user.tag}) is online`)
	})
}
