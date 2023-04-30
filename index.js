const {Client, Events, GatewayIntentBits, Collection,SlashCommandBuilder} = require('discord.js')
require('dotenv').config();
const fs = require("node:fs");
const path = require("node:path");
const mongoose = require("mongoose")

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
})

const eventsPath = path.join(__dirname, "events")
const eventFiles = fs.readdirSync(eventsPath).filter((file)=> file.endsWith(".js"));

for(const file of eventFiles){
    const filePath = path.join(eventsPath, file)
    const event = require(filePath);
    if(event.once){
        client.once(event.name,(...args) => event.execute(...args));
    } else {
        client.on(event.name,(...args) => event.execute(...args));
    }
}

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

mongoose.connect(process.env.MONGODB_SERVER,{
	useNewUrlParser: true,
	useUnifiedTopology: true,
}).then(() => {
	console.log('Connected to database');
}).catch((err) =>{
	console.log(err);
});


client.login(process.env.TOKEN_DEV)