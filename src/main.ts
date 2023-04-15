import { Client, Events, GatewayIntentBits } from 'discord.js'
import { ConfigFileSchema } from './types'
import path from 'path'
import fs from 'fs'
import { onReady, onInteractionCreate } from './listeners/index.js'

const configFilePath: string = path.join(__dirname, './config.json')
if(!fs.existsSync(configFilePath)) {
	console.error(`${configFilePath} does not exist. Please create a config file.`);
	process.exit(1)
}

const configFile = JSON.parse(fs.readFileSync(configFilePath, 'utf-8')) as ConfigFileSchema
const discordClient = new Client({ intents: [GatewayIntentBits.Guilds] })
const botClient = {
	discord: discordClient,
	config: configFile,
}

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
botClient.discord.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
})

// Log in to Discord with your client's token
onReady(botClient)
onInteractionCreate(botClient)
botClient.discord.login(configFile.token)
