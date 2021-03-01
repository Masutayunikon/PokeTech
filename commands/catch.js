const Pokedex = require('pokedex-promise-v2');
const config = require("../config.json");
const fs = require('fs');
const P = new Pokedex();

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

async function getRarity(id) {
    return P.getPokemonSpeciesByName(id).then(response => {
        if (response.is_mythical)
            return "mythical";
        else if (response.is_legendary)
            return "legendary";
        else if (response.is_baby)
            return "baby";
        else
            return "normal";
    })
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

module.exports = {
    name: "catch",
    description: "Catch pokemon (every 10 minutes)",
    usage: "catch",
    aliases: ["c"],
    permissions: [],
    async execute(msg, args) {
        const {refresh_user_json} = require("../users_utils.js");

        if (!fs.existsSync(`./users/${msg.author.id}.json`))
            msg.channel.send(`<@${msg.author.id}> you are not registered.`).catch(err => console.error(err));
        else {
            let this_user = require(`./users/${msg.author.id}.json`)
            let date = new Date();
            let cooldown = new Date(this_user.cooldown - Date.now());
            if (this_user.cooldown > date)
                return msg.reply(`The pokemon was hidden for the moment. ! **${cooldown.getMinutes()} minutes ${cooldown.getSeconds()} seconds left**`);
            this_user.cooldown = date.setMinutes(date.getMinutes() + 6);
            if (this_user.notification)
                setTimeout(() => msg.author.send("You can catch a new pokemon =D"), 360000);
            let pokemon_id = setChanceGetLegendary();
            let pokemon_image_url = {url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemon_id}.gif`}
            let rarity = await getRarity(pokemon_id);
            let color = "BLUE";
            if (rarity === "legendary")
                color = "GOLD"
            else if (rarity === "mythical")
                color = "PURPLE";
            else if (rarity === "baby")
                color = "GREEN";
            P.getPokemonByName(pokemon_id).then(resp => {
                msg.channel.send(`**<@${msg.author.id}> catch ${resp.forms[0].name}**`,
                    {
                        embed: {
                            color: color,
                            thumbnail: pokemon_image_url,
                            description: `Pokedex ID: ${pokemon_id}\n` +
                                `Type: ${get_types(resp.types)}\n` +
                                `Height: ${((parseFloat(resp.height) / 10) * 3.281).toFixed(2)} feet\n` +
                                `Weight: ${(parseFloat(resp.weight) * 2.205).toFixed(2)} lbs\n`
                        }
                    }).catch(err => console.error(err));
            }).catch(error => console.log('There was an ERROR: ', error));
            let pokedex = this_user.pokedex;
            pokedex.push(pokemon_id);
            this_user.pokedex_completion = get_nbr_of_pokemon_catch(pokedex);
            pokedex.sort((a, b) => { return a - b; });
            if (refresh_user_json(msg.author.id) === -1)
                console.log(`An error for save pokemon ${pokemon_id} for player ${msg.author.id} in json files.`);
            else
                console.log(`Saving a new pokemon ${pokemon_id} for player ${msg.author.id} in json files with success.`);
        }
    },
};