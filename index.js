const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');
const Pokedex = require('pokedex-promise-v2');
const {getIdArray} = require("./utils/pokemon");

const client = new Client({ intents: [Intents.FLAGS.GUILDS], restRequestTimeout: 60000 });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

global.client = client;
global.idArray = [];
global.P = new Pokedex();

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

if (!fs.existsSync('./users/'))
    fs.mkdir('./users/', err => {
        console.log("Create users directory...")
        if (err)
            console.error("Can't create users directory");
    });

if (!fs.existsSync('./events.json')) {
    console.log("Create events.json file...")
    let object = {
        "hourly_give": {
            "last": Date.now() + 3 * 60 * 60 * 1000
        },
    }
    fs.writeFile('./events.json', JSON.stringify(object, null, 4), err => {
        if (err)
            console.log("Can't create events.json file");
    })
}

client.once('ready', async () => {
    if (idArray.length === 0) {
        console.log("Fetch pokemon id...")
        global.idArray = await getIdArray();
    }
    console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(token).then(err => {
    if (err)
        console.error(err);
});