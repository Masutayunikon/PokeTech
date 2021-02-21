const config = require("./tsconfig.json");
const pokedex_name = require("./pokedex_name.json");
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
        "user_number": 0,
        "pokedex": [],
        "pokedex_completion": 0,
        "username": msg.author.username,
        "notification": true
    }

    fs.writeFile(`./users/${msg.author.id}.json`, JSON.stringify(new_user_json, null, 2), (err) => {
        if (err)
            console.log("Error to save json file");
        else
            console.log("Save new users json files.");
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
        if ((i + 1) !== types.length)
            type += ", ";
    }
    return type;
}

function setChanceGetLegendary() {
    let nbr = getRandomIntInclusive(1, 649);
    if (config.legendary_array.includes(nbr, 0)) {
        if (getRandomIntInclusive(0, 1))
            return nbr;
        else
            nbr = getRandomIntInclusive(1, 649);
    }
    return nbr;
}

function catching(msg, args) {
    if (args.length)
        return msg.channel.send(`<@${msg.author.id}> I don't have any arguments.`);
    if (!fs.existsSync(`./users/${msg.author.id}.json`))
        msg.channel.send(`<@${msg.author.id}> you are not registered.`).catch(err => console.error(err));
    else {
        let this_user = require(`./users/${msg.author.id}.json`)
        let date = new Date();
        let cooldown = new Date(this_user.cooldown - Date.now());
        if (this_user.cooldown > date)
            return msg.reply(`The pokemon was hidden for the moment. ! **${cooldown.getMinutes()} minutes ${cooldown.getSeconds()} seconds left**`);
        this_user.cooldown = date.setMinutes(date.getMinutes() + 10);
        if (this_user.notification)
            setTimeout(() => msg.author.send("You can catch a new pokemon =D"), 600000);
        let pokemon_id = setChanceGetLegendary();
        let pokemon_image_url = {url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemon_id}.gif`}
        P.getPokemonByName(pokemon_id).then(response => {
            name = response.forms[0].name;
            let color = "BLUE";
            if (config.legendary_array.includes(pokemon_id, 0))
                color = "GOLD";
            msg.channel.send(`**<@${msg.author.id}> catch ${response.forms[0].name}**`,
                {
                    embed: {
                        color: color,
                        thumbnail: pokemon_image_url,
                        description: `Pokedex ID: ${response.id}\n` +
                            `Type: ${get_types(response.types)}\n` +
                            `Height: ${((parseFloat(response.height) / 10) * 3.281).toFixed(2)} feet\n` +
                            `Weight: ${(parseFloat(response.weight) * 2.205).toFixed(2)} lbs\n`
                    }
                }).catch(err => console.error(err));
        }).catch(error => console.log('There was an ERROR: ', error));
        let pokedex = this_user.pokedex;
        pokedex.push(pokemon_id);
        this_user.pokedex_completion = get_nbr_of_pokemon_catch(pokedex);
        pokedex.sort((a, b) => {
            return a - b;
        });
        if (refresh_user_json(msg.author.id) === -1)
            console.log(`An error for save pokemon ${pokemon_id} for player ${msg.author.id} in json files.`);
        else
            console.log(`Saving a new pokemon ${pokemon_id} for player ${msg.author.id} in json files with success.`);
    }
}

function test(message, args) {
    message.channel.send("ntm");
}

function exchange(message, args) {
    if (message.mentions.members.size === 1) {
        console.log(fs.existsSync(`./${message.mentions.users.first().id}.json`));
        if (fs.existsSync(`./${message.mentions.users.first().id}.json`) && fs.existsSync(`./${message.author.id}.json`) && message.mentions.users.first().id !== message.author.id)
            message.channel.send("test reussie");
        else
            message.channel.send("upsi");
    } else
        message.channel.send("upsi")
}

function leaderboard(msg, args) {
    if (args.length)
        return msg.channel.send(`<@${msg.author.id}> I don't have any arguments.`);
    try {
        let users = [];
        let dir = fs.readdirSync("./users/", "UTF-8");
        dir.forEach(value => {
            let user = require(`./users/${value}`);
            let legendary = 0;
            for (let i = 0; i < user.pokedex.length; i++)
                if (config.legendary_array.includes(user.pokedex[i], 0))
                    legendary++;
            let json = {
                id: user.discord_id,
                pc_size: user.pokedex.length,
                username: user.username,
                legendary: legendary,
                pokedex: user.pokedex_completion
            }
            users.push(json);
        })
        users.sort((a, b) => {
            return b.pc_size - a.pc_size;
        })
        let str_user = ""
        for (let i = 0; i < users.length; i++)
            str_user += `**${users[i].username}** - Pokédex: ${users[i].pokedex} ` + "`" + users[i].pc_size + "`" + `- Legendary: **${users[i].legendary}**\n`;
        msg.channel.send(new MessageEmbed({
            color: "BLUE",
            title: "Catcher - Pokedex Completion",
            description: str_user
        })).catch(err => console.log(err));
    } catch (err) {
        msg.channel.send("No user are registered");
    }
}

function send_menu(arr, this_user, first, page, msg, rest, is_pc)
{
    let footer = is_pc ? `Pokemon: ${this_user.pokedex.length}` : `completion: ${this_user.pokedex_completion}/649`;
    arr.push(new MessageEmbed({
        title: `page ${1}`,
        description: `${first}`
    }).setFooter(footer));

    for (const text of rest) {
        arr.push(new MessageEmbed({
            title: `page ${page}`,
            description: `${text}`
        }).setFooter(footer));
        page++;
    }
    new rm.menu({
        channel: msg.channel,
        userID: msg.author.id,
        pages: arr
    })
}

function see_pokedex(msg, args) {
    let user = args.length > 0 ? msg.mentions.users.first().id : msg.author.id;
    if (!fs.existsSync(`./users/${user}.json`))
        msg.channel.send(`<@${user}> are not registered.`).catch(err => console.error(err));
    else {
        let this_user = require(`./users/${user}.json`);
        let pokedex = this_user.pokedex;
        let all_name = "";
        let page = 2;
        let arr = [];
        for (let i = 1; i < 650; i++) {
            let pokedex_name_str = "???????"
            if (pokedex.includes(i, 0)) {
                if (config.legendary_array.includes(i, 0))
                    pokedex_name_str = `**${pokedex_name.pokedex_name[i - 1]}**`
                else
                    pokedex_name_str = pokedex_name.pokedex_name[i - 1];
            }
            all_name += `${i}: ${pokedex_name_str}`
            all_name += '\n';
        }
        const [first, ...rest] = Util.splitMessage(all_name, {maxLength: 256});
        send_menu(arr, this_user, first, page, msg, rest, false);
    }
}


function see_pc(msg, args) {
    let user = args.length > 0 ? msg.mentions.users.first().id : msg.author.id;
    if (!fs.existsSync(`./users/${user}.json`))
        msg.channel.send(`<@${user}> are not registered.`).catch(err => console.error(err));
    else {
        let this_user = require(`./users/${user}.json`);
        let pokedex = this_user.pokedex;
        let all_name = "";
        let page = 2;
        let arr = [];
        for (let i = 0; i < pokedex.length; i++) {
            if (config.legendary_array.includes(pokedex[i], 0))
                all_name += `ID: ${pokedex[i]} **${pokedex_name.pokedex_name[pokedex[i] - 1]}**\n`
            else
                all_name += `ID: ${pokedex[i]} ${pokedex_name.pokedex_name[pokedex[i] - 1]}\n`;
        }
        const [first, ...rest] = Util.splitMessage(all_name, {maxLength: 192});
        send_menu(arr, this_user, first, page, msg, rest, true);
    }
}

function notification(msg, args) {
    if (args.length)
        return msg.channel.send(`<@${msg.author.id}> I don't have any arguments.`);
    if (!fs.existsSync(`./users/${msg.author.id}.json`))
        msg.channel.send(`<@${msg.author.id}> you are not registered.`).catch(err => console.error(err));
    else {
        let this_user = require(`./users/${msg.author.id}.json`);
        if (!this_user.notification) {
            this_user.notification = true;
            msg.author.send("Hello PokeUsers =D!").catch(a => {
                if (a.code === 50007) {
                    msg.reply("Can't send DM to your user because is disabled!");
                    this_user.notification = false
                }
            });
            if (this_user.notification)
                msg.reply("I send you private message =D");
        } else if (this_user.notification) {
            this_user.notification = false;
            msg.channel.send(`<@${msg.author.id}>, I disabled private message with you, goodbye my friend...`);
        }

        if (refresh_user_json(msg.author.id) === -1)
            console.log(`An error for save pokemon ${msg.author.id} json files!`);
        else
            console.log(`Saving ${msg.author.id} json files with success.`);
    }
}

function register_user(msg, args) {
    if (args.length)
        return msg.channel.send(`<@${msg.author.id}> I don't have any arguments.`);
    if (fs.existsSync(`./users/${msg.author.id}.json`))
        msg.channel.send(`<@${msg.author.id}> you have already an account.`)
    else {
        create_new_user(msg);
        msg.channel.send(`<@${msg.author.id}> your account was created with success =D!`);
    }
}

function help(msg, args) {
    if (args.length)
        return msg.channel.send(`<@${msg.author.id}> I don't have any arguments.`);
    msg.channel.send(`<@${msg.author.id}>\n` +
        "```" +
        "Here are my commands:\n" +
        config.prefix + "help to get help\n" +
        config.prefix + "register to register\n" +
        config.prefix + "catch to catch a pokemon (every 10 minutes)\n" +
        config.prefix + "pokedex (optional: @player) to see player pokedex with these pokemon catch inside\n" +
        config.prefix + "pc (optional : @player) to see player pc (pokemon captured box)\n" +
        config.prefix + "notif to enable or disable private message notification\n" +
        config.prefix + "leaderboard to see the best catcher in the world\n" +
        config.prefix + "patch to see my last patch notes" +
        "```");
}

function patch_notes(msg, args) {
    if (args.length)
        return msg.channel.send(`<@${msg.author.id}> I don't have any arguments.`);
    msg.channel.send(`<@${msg.author.id}>\n` + "```" + "Here are my patch notes\n" +
        "17/02/2021 bot launched\n" +
        "18/02/2021 Legendary pokemon is now write in bold in pokedex\n" +
        "18/02/2021 You can see another player pokedex with ^pokedex @name\n" +
        "18/02/2021 You can see your pokemon with ^pc\n" +
        "19/02/2021 Adding leaderboard ^leaderboard\n" +
        "***in progress*** You can exchange your pokemon with your friend" +
        "```");
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.username}!`);
    cmd.set("catch", catching);
    cmd.set("pokedex", see_pokedex);
    cmd.set("register", register_user);
    cmd.set("test", test);
    cmd.set("notif", notification);
    cmd.set("help", help);
    cmd.set("exchange", exchange);
    cmd.set("patch", patch_notes);
    cmd.set("pc", see_pc);
    cmd.set("leaderboard", leaderboard);
    cmd.set("c", catching);
    cmd.set("ld", leaderboard);
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