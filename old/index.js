const config = require("./config.json");
const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./old/commands/${file}`);
    client.commands.set(command.name, command);
}

async function setup_requirement() {
    if (!fs.existsSync("./users/"))
        fs.mkdir("./users/", err => {
            if (err)
                console.error("Can't create users directory");
        })
    if (!fs.existsSync("./api/"))
        fs.mkdir("./api/", err => {
            if (err)
                console.error("Can't create api/species directory");
        })
    if (!fs.existsSync("./api/species/"))
        fs.mkdir("./api/species/", err => {
            if (err)
                console.error("Can't create api/species directory");
        })
    fs.readdir("./api/species/", async (err, files) => {
        if (files.length !== 649) {
            for (let i = 1; i <= 649; i++)
                await P.getPokemonSpeciesByName(i).then(resp => {
                    fs.writeFile(`./api/species/${i}.json`, JSON.stringify(resp, null, 4), (err) => {
                        if (err)
                            console.log("Error to save %d species json file", i);
                        else
                            console.log("Save new species json files.");
                    });
                })
        }
    });

}

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.username}!`);
    await setup_requirement();
});

client.on('message', message => {
    if (!message.content.startsWith(config.prefix) || message.author.bot || !config.channels.includes(message.channel.id)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));;

    if (!command)
        return message.reply("I don't understand what you tell me!");

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!').catch(err => console.log(err));
    }
});

client.login(config.token).catch(err => console.error(err));
