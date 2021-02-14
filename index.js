const config = require("./tsconfig.json");
const users = require("./user.json");
let pokedex_name = require("./pokedex_name.json");

const Discord = require('discord.js');
const Pokedex = require('pokedex-promise-v2');
const fs = require('fs');
const P = new Pokedex();
const client = new Discord.Client();

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
    let new_user_json = {user: [
            {"discord_id": user_id},
            {"user_number": (users.users.length + 1)},
            {"pokedex": []},
            {"pokedex_completion": 0},
            {"username": msg.author.username},
        ]}

    users.users.push(new_user_json);
    fs.writeFile('./user.json', JSON.stringify(users, null, 4), (err) => {
        if (err) {
            console.log("Error to save json file");
        } else {
            console.log("Save new users in json files.");
            console.log(users.users[0]);
        }
    });
}

function refresh_user_json() {
    fs.writeFile('./user.json', JSON.stringify(users, null, 4), (err) => {
        if (err) {
            return (-1)
        }
    });
    return (1);
}

function where_is_user_in_json(id) {
    for (let i = 0; i < users.users.length; i++) {
        if (users.users[i].user[0].discord_id === id) {
            return (i);
        }
    }
    return (-1);
}

function user_exist(id) {
    for (let i = 0; i < users.users.length; i++) {
        if (users.users[i].user[0].discord_id === id) {
            return (1);
        }
    }
    return (0);
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

function get_good_name(name) {
    if (config.wrong_name.includes(name, 0)) {
        name = config.good_name[config.wrong_name.indexOf(name)];
    }
    return name;
}

function setChanceGetLegendary() {
    let nbr = getRandomIntInclusive(1, 650);
    if (config.legendary_array.includes(nbr, 0)) {
        if (getRandomIntInclusive(0, 1)) {
            return nbr;
        } else {
            nbr = getRandomIntInclusive(1, 650);
        }
    }
    return nbr;
}

client.on('ready', () => {
    console.log( `Logged in as ${client.user.username}!`);
});

client.on(`message`, msg => {
    if (msg.content === '^catch') {
        let pokemon_id = setChanceGetLegendary();
        P.getPokemonByName(pokemon_id).then(function(response) {
                name = get_good_name(response.forms[0].name);
                msg.channel.send(`**<@${msg.author.id}> catch ${response.forms[0].name}**`,
                    {embed: {
                                color: "BLUE",
                                thumbnail: {url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemon_id}.gif`},
                                description:`Pokedex ID: ${response.id}\n` +
                                            `Type: ${get_types(response.types)}\n` +
                                            `Height: ${((parseFloat(response.height) / 10 ) * 3.281).toFixed(2)} feet\n` +
                                            `Weight: ${(parseFloat(response.weight) * 2.205).toFixed(2)} lbs\n`}}).catch(err => console.error(err));
            })
            .catch(function(error) {
                console.log('There was an ERROR: ', error);
            });
        let pokedex = users.users[where_is_user_in_json(msg.author.id)].user[2].pokedex;
        pokedex.push(pokemon_id);
        users.users[where_is_user_in_json(msg.author.id)].user[3].pokedex_completion = get_nbr_of_pokemon_catch(pokedex);
        pokedex.sort(function(a, b){return a - b});
        if (refresh_user_json(where_is_user_in_json()) === -1) {
            console.log(`An error for save pokemon ${pokemon_id} for player ${msg.author.id} in json files.`);
        } else {
            console.log(`Saving a new pokemon ${pokemon_id} for player ${msg.author.id} in json files with success.`);
        }
        console.log(users.users[where_is_user_in_json(msg.author.id)].user[3]);
    }
/*-----------------------------------------------------------------------------------------------------------------------*/
    if (msg.content === "^register") {
        if (user_exist(msg.author.id)) {
            msg.channel.send(`<@${msg.author.id}> you have already an account.`)
        } else {
            create_new_user(msg);
            msg.channel.send(`<@${msg.author.id}> your account was created with success =D!`);
        }
    }
/*-----------------------------------------------------------------------------------------------------------------------*/
    if (msg.content === "^pokedex") {
        let pokedex = users.users[where_is_user_in_json(msg.author.id)].user[2].pokedex;
        let all_name = "";
        for (let i = 0; i < pokedex.length; i++) {
            all_name += `${pokedex_name.pokedex_name[pokedex[i] - 1]} >> ${pokedex[i]}`
            all_name += '\n';
        }
        msg.channel.send(`Your pokedex <@${msg.author.id}> :\n${all_name}`, {split: true}).catch(err => console.log(err));
    }
});

client.login(config.token).catch(err => console.error(err));