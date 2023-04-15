import { Client, Snowflake } from 'discord.js'

export type ConfigFileSchema = {
	token: string,
	guild: Snowflake,
	createTeamApiEndpoint: string,
	viewTeamApiEndpoint: string,
}

export type BotClient = {
	discord: Client,
	config: ConfigFileSchema,
}

export type CreateTeamApiRequest = {
	name: string,
	members: Snowflake[],
}

export type CreateTeamApiResponse = {
	status: 'success',
} | {
	status: 'error',
	message: string,
}

export type ViewTeamApiRequest = {
	member: Snowflake,
}

export type ViewTeamApiResponse = {
	status: 'success',
	data: { 
		team_name: string,
		members: Snowflake[]
	} | null,
} | {
	status: 'error',
	message: string,
}
