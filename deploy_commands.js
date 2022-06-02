const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
}

//https://projectpokemon.org/images/normal-sprite/exeggutor-alola.gif
//https://projectpokemon.org/images/shiny-sprite/exeggutor-alola.gif

const rest = new REST({version: 9}).setToken(token);

(async () => {
    try {
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands});
        console.log(`command register succesfully for ${guildId}`);
    } catch (error) {
        console.error(error);
    }
})();