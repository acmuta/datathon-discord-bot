import { CommandInteraction, Events } from 'discord.js'
import { OnDiscordEvent } from '.'
import { CommandRegistry } from './../commands/CommandRegistry'
import { BotClient } from '../types'

export const onInteractionCreate: OnDiscordEvent = (client: BotClient): void => {
	client.discord.on(Events.InteractionCreate, async (interaction) => {
		if (interaction.isCommand() || interaction.isContextMenuCommand()) {
			await handleSlashCommand(client, interaction)
		}
	})
}

const handleSlashCommand = async (client: BotClient, interaction: CommandInteraction): Promise<void> => {
	const slashCommand = CommandRegistry.find(c => c.data.name === interaction.commandName);
	if (!slashCommand) {
		await interaction.followUp({ content: 'An error has occurred', ephemeral: true })
		return
	}

	try {
		await slashCommand.run(client, interaction)
	} catch (error) {
		console.error(error);
		await interaction.followUp({ content: 'An error has occurred', ephemeral: true })
	}
};
