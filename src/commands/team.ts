import {
	APIEmbedField,
	CommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
	SlashCommandSubcommandBuilder,
	SlashCommandUserOption,
	Snowflake,
	User,
} from 'discord.js'
import { Command, CommandRunFn } from './Command'
import {
	BotClient,
	CreateTeamApiRequest,
	CreateTeamApiResponse,
	ViewTeamApiRequest,
	ViewTeamApiResponse,
} from '../types'

type SubCommandName = 'create' | 'view'
const OptionTeamName = 'team-name'

// Validates an array of users so that there cannot be duplicate users or bots
const getValidUsers = (users: (User | null)[]): User[] => {
	const uniqueUsers: Map<string, User> = new Map()
	for (const user of users) {
		const userTag = user?.tag as string
		if (!uniqueUsers.has(userTag) && user?.bot === false) {
			uniqueUsers.set(userTag, user as User)
		}
	}

	return Array.from(uniqueUsers.values())
}

const teamEmbed = (
	teamName: string,
	author: User | undefined,
	members: (Snowflake | null)[],
) => {
	const fields: APIEmbedField[] = []

	let i = 1
	for (const member of members) {
		if (member === null) {
			continue
		}
		fields.push({ name: `Team member #${i}`, value: `<@${member}>` })
		i++
	}

	const builder = new EmbedBuilder()
		.setTitle(`Team name: ${teamName}`)
		.setColor('#b89162')
		.setFields(fields)

	if (author) {
		builder
			.setAuthor({ name: `Created by ${author.tag}` })
			.setThumbnail(author.avatarURL())
	}

	return builder
}

const teamCreate: CommandRunFn = async (
	{ config }: BotClient,
	interaction: CommandInteraction,
) => {
	if (!interaction.isChatInputCommand()) return

	const author = interaction.user
	const teamName = interaction.options.getString(OptionTeamName) as string
	const members = [
		author,
		interaction.options.getUser('team-member-1'),
		interaction.options.getUser('team-member-2'),
		interaction.options.getUser('team-member-3'),
	]

	const validMembers = getValidUsers(members)

	const response = (await (
		await fetch(config.createTeamApiEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name: teamName,
				members: validMembers.map((m) => m.id),
			} satisfies CreateTeamApiRequest),
		})
	).json()) as CreateTeamApiResponse

	if (response.status === 'error') {
		await interaction.reply({
			content: unquote(response.message),
			allowedMentions: { parse: ['users'] },
		})
	} else {
		await interaction.reply({
			embeds: [
				teamEmbed(
					teamName,
					author,
					validMembers.map((m) => m.id),
				),
			],
		})
	}
}

const unquote = (str: string) => str.replace(/(^"|"$)/ug, '')

const teamView: CommandRunFn = async (
	{ config }: BotClient,
	interaction: CommandInteraction,
) => {
	if (!interaction.isChatInputCommand()) return

	const response = (await (
		await fetch(config.viewTeamApiEndpoint, {
			method: 'POST',
			body: JSON.stringify({
				member: interaction.user.id,
			} satisfies ViewTeamApiRequest),
		})
	).json()) as ViewTeamApiResponse

	if (response.status === 'error') {
		await interaction.reply({
			content: unquote(response.message),
		})
	} else if (!response.data) {
		await interaction.reply({
			content: "You're not in any team at the moment.",
		})
	} else {
		const { team_name: teamName, members } = response.data
		await interaction.reply({
			embeds: [
				teamEmbed(
					teamName,
					members[0] === interaction.user.id ? interaction.user : undefined,
					members,
				),
			],
		})
	}
}

const newUserOption = (
	index: number,
	required = false,
): SlashCommandUserOption => {
	return new SlashCommandUserOption()
		.setName(`team-member-${index}`)
		.setDescription('Add a member to the team')
		.setRequired(required)
}

export const team: Command = {
	data: new SlashCommandBuilder()
		.setName('team')
		.setDescription('Datathon teams')
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName('create' satisfies SubCommandName)
				.setDescription('Create a team')
				.addStringOption((builder) =>
					builder
						.setName(OptionTeamName)
						.setDescription('What is the name of the team?')
						.setRequired(true),
				)
				.addUserOption(newUserOption(1, true))
				.addUserOption(newUserOption(2))
				.addUserOption(newUserOption(3)),
		)
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName('view' satisfies SubCommandName)
				.setDescription('View information about your team'),
		),

	run: async (client: BotClient, interaction: CommandInteraction) => {
		if (!interaction.isChatInputCommand()) return

		const subCommand = interaction.options.getSubcommand()
		if (subCommand === 'create' && (subCommand satisfies SubCommandName)) {
			teamCreate(client, interaction)
		} else if (subCommand === 'view' && (subCommand satisfies SubCommandName)) {
			teamView(client, interaction)
		} else {
			await interaction.reply('Subcommand not found.')
		}
	},
}
