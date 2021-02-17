const config = require("./tsconfig.json");
let pokedex_name = require("./pokedex_name.json");
const {Util, MessageEmbed} = require("discord.js");
const Discord = require('discord.js');
const Pokedex = require('pokedex-promise-v2');
const fs = require('fs');
const P = new Pokedex();
const rm = require('discord.js-reaction-menu')
const client = new Discord.Client();

const cmd = new Map;

function get_nbr_of_pokemon_catch(pokedex) {
    let nbr = 0;
    let tab = [];
    for (let i = 0; i < pokedex.length; i++) {
        if (!tab.includes(pokedex[i], 0)) {
            tab.push(pokedex[i]);
            nbr += 1;
        }
    }
    return nbr;
}

function create_new_user(msg) {
    let user_id = msg.author.id;
    let new_user_json = {
        "discord_id": user_id,
        "pokedex": [],
        "pokedex_completion": 0,
        "username": msg.author.username,
        "notification": false,
        "cooldown": 0
    }

    fs.writeFile(`./users/${msg.author.id}.json`, JSON.stringify(new_user_json, null, 2), (err) => {
        if (err) {
            console.log("Error to save json file");
        } else {
            console.log("Save new users json files.");
        }
    });
}

function refresh_user_json(id) {
    let this_user = require(`./users/${id}.json`);
    fs.writeFile(`./users/${id}.json`, JSON.stringify(this_user, null, 2), (err) => {
        if (err)
            return (-1)
    });
    return (1);
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function get_types(types) {
    let type = ""
    for (let i = 0; i < types.length; i++) {
        type += types[i].type.name;
        if ((i + 1) !== types.length) {
            type += ", ";
        }
    }
    return type;
}

function setChanceGetLegendary() {
    let nbr = getRandomIntInclusive(1, 649);
    if (config.legendary_array.includes(nbr, 0)) {
        if (getRandomIntInclusive(0, 1)) {
            return nbr;
        } else {
            nbr = getRandomIntInclusive(1, 649);
        }
    }
    return nbr;
}

function catching(msg, args) {
    if (args.length) {
        return msg.channel.send(`<@${msg.author.id}> I don't have any arguments.`);
    }
    if (!fs.existsSync(`./users/${msg.author.id}.json`))
        msg.channel.send(`<@${msg.author.id}> you are not registered.`).catch(err => console.error(err));
    else {
        let this_user = require(`./users/${msg.author.id}.json`)
        let date = new Date();
        if (this_user.cooldown > date)
            return msg.reply(`The pokemon was hidden for the moment. ! ${new Date(this_user.cooldown * 1).toTimeString()}`);
        date = date.setMinutes(date.getMinutes() + 10);
        this_user.cooldown = date;
        let pokemon_id = setChanceGetLegendary();
        P.getPokemonByName(pokemon_id).then(function (response) {
            name = response.forms[0].name;
            let color = "BLUE";
            if (config.legendary_array.includes(pokemon_id, 0))
                color = "GOLD";
            msg.channel.send(`**<@${msg.author.id}> catch ${response.forms[0].name}**`,
                {
                    embed: {
                        color: color,
                        thumbnail: {url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemon_id}.gif`},
                        description: `Pokedex ID: ${response.id}\n` +
                            `Type: ${get_types(response.types)}\n` +
                            `Height: ${((parseFloat(response.height) / 10) * 3.281).toFixed(2)} feet\n` +
                            `Weight: ${(parseFloat(response.weight) * 2.205).toFixed(2)} lbs\n`
                    }
                }).catch(err => console.error(err));
        }).catch(function (error) {
            console.log('There was an ERROR: ', error);
        });
        let pokedex = this_user.pokedex;
        pokedex.push(pokemon_id);
        this_user.pokedex_completion = get_nbr_of_pokemon_catch(pokedex);
        pokedex.sort(function (a, b) {
            return a - b
        });
        if (refresh_user_json(msg.author.id) === -1) {
            console.log(`An error for save pokemon ${pokemon_id} for player ${msg.author.id} in json files.`);
        } else {
            console.log(`Saving a new pokemon ${pokemon_id} for player ${msg.author.id} in json files with success.`);
        }
    }
}

function exchange(message, args) {
    if (message.mentions.members.size === 1) {
        console.log(fs.existsSync(`./users/${message.mentions.users.first().id}.json`));
        if (fs.existsSync(`./users/${message.mentions.users.first().id}.json`) && fs.existsSync(`./users/${message.author.id}.json`)) {
            message.channel.send("test reussie");
        } else {
            message.channel.send("upsi");
        }
    } else {
        message.channel.send("upsi")
    }
}

function see_pokedex(msg, args) {
    let user = args.length > 0 ? msg.mentions.users.first().id : msg.author.id;
    if (!fs.existsSync(`./users/${user}.json`)) {
       if (args)
           msg.channel.send(`<@${user}> is not registered.`).catch(err => console.error(err));
       else
           msg.channel.send(`<@${user}> you are not registered.`).catch(err => console.error(err));
    } else {
        let this_user = require(`./users/${user}.json`);
        let pokedex = this_user.pokedex;
        let all_name = "";
        let page = 2;
        let arr = [];
        for (let i = 0; i < pokedex.length; i++) {
            if (config.legendary_array.includes(pokedex[i], 0)) {
                all_name += `**${pokedex_name.pokedex_name[pokedex[i] - 1]}** | *${pokedex[i]}*`
            } else {
                all_name += `${pokedex_name.pokedex_name[pokedex[i] - 1]} | *${pokedex[i]}*`
            }
            all_name += '\n';
        }

        const [first, ...rest] = Util.splitMessage(all_name, {maxLength: 256});
        arr.push(new MessageEmbed({
            title: `page ${1}`,
            description: `${first}`
        }).setFooter(`completion: ${this_user.pokedex_completion}/649`));

        for (const text of rest) {
            arr.push(new MessageEmbed({
                title: `page ${page}`,
                description: `${text}`
            }).setFooter(`completion: ${this_user.pokedex_completion}/649`));
            page++;
        }
    }
}

function notification(msg, args) {
    if (args.length) {
        return msg.channel.send(`<@${msg.author.id}> I don't have any arguments.`);
    }
    if (!fs.existsSync(`./users/${msg.author.id}.json`)) {
        msg.channel.send(`<@${msg.author.id}> you are not registered.`).catch(err => console.error(err));
    } else {
        let this_user = require(`./users/${msg.author.id}.json`);
        if (this_user.user[5].notification === false) {
            this_user.user[5].notification = true;
            msg.author.send("Hello PokeUsers =D!").catch(err => console.error(err));
            msg.channel.send(`<@${msg.author.id}>, I send you a private message =D`);
        } else {
            this_user.user[5].notification = false;
            msg.channel.send(`<@${msg.author.id}>, I disabled private message with you, goodbye my friend...`);

        }

        if (refresh_user_json(msg.author.id) === -1) {
            console.log(`An error for save pokemon ${msg.author.id} json files!`);
        } else {
            console.log(`Saving ${msg.author.id} json files with success.`);
        }
    }
}

function register_user(msg, args) {
    if (args.length) return msg.channel.send(`<@${msg.author.id}> I don't have any arguments.`);
    if (fs.existsSync(`./users/${msg.author.id}.json`))
        msg.channel.send(`<@${msg.author.id}> you have already an account.`)
    else {
        create_new_user(msg);
        msg.channel.send(`<@${msg.author.id}> your account was created with success =D!`);
    }
}

function help(msg, args) {
    if (args.length) {
        return msg.channel.send(`<@${msg.author.id}> I don't have any arguments.`);
    }
    msg.channel.send(`<@${msg.author.id}>\n` + "```" + "Here are my orders:\n" +
        "^help to get help\n" +
        "^register to register\n" +
        "^catch to catch a pokemon (every 10 minutes)\n" +
        "^pokedex to see his pokedex with these pokemon catch inside\n" +
        "^notif to enable or disable private message notification" + "```");
}

function setup_requirement() {
    if (!fs.existsSync("./users/"))
        fs.mkdir("./users/", err => {
            if (err)
                console.error("Can't create users directory");
        })
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.username}!`);
    cmd.set("catch", catching);
    cmd.set("pokedex", see_pokedex);
    cmd.set("register", register_user);
    cmd.set("notif", notification);
    cmd.set("help", help);
    cmd.set("exchange", exchange);
    setup_requirement();
});

client.on('message', message => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (cmd.get(command) === undefined) {
        if (message.content !== "^^")
            message.channel.send(`<@${message.author.id}>, I don't understand what you tell me!`).catch(err => console.error(err));
    } else
        cmd.get(command)(message, args);
});

client.login(config.token).catch(err => console.error(err));