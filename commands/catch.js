const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, MessageEmbed, ColorResolvable, EmojiResolvable } = require('discord.js');
const Pokedex = require('pokedex-promise-v2')
const request = require('request');
const fs = require('fs');
const config = require('../config.json');

global.idArray = [];
global.P = new Pokedex();

async function getIdArray() {
    let result = [];
    const interval = {
        limit: 10000,
        offset: 0
    }
    await P.getPokemonsList(interval)
        .then((response) => {
            for (let items in response.results) {
                let _split = response.results[items].url.split("/");
                result.push(Number(_split[_split.length - 2]));
            }
        }).catch(error => {
            console.error(error);
        })
    return result;
}

function getRandomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// check if url https://projectpokemon.org/images/normal-sprite/${pokemon.name}.gif return 404 if yes return pokemon.sprites.front_default url string
function getSprite(pokemon, shiny) {
    if (shiny) {
        return new Promise((resolve, reject) => {
            if (pokemon.sprites.versions["generation-v"]["black-white"].animated.front_shiny)
                return resolve(pokemon.sprites.versions["generation-v"]["black-white"].animated.front_shiny);
            request(`https://projectpokemon.org/images/shiny-sprite/${pokemon.name}.gif`, (error, response, body) => {
                if (error)
                    return reject(error);
                if (response.statusCode === 404)
                    return resolve(pokemon.sprites.front_shiny);
                return resolve(`https://projectpokemon.org/images/shiny-sprite/${pokemon.name}.gif`);
            })
        })
    }
    return new Promise((resolve, reject) => {
        if (pokemon.sprites.versions["generation-v"]["black-white"].animated.front_default)
            return resolve(pokemon.sprites.versions["generation-v"]["black-white"].animated.front_default);
        request(`https://projectpokemon.org/images/normal-sprite/${pokemon.name}.gif`, (error, response, body) => {
            if (error)
                return reject(error);
            if (response.statusCode === 404) {
                if (pokemon.sprites.front_default)
                    return resolve(pokemon.sprites.front_default);
                return resolve(pokemon.sprites.versions["generation-viii"]["icons"].front_default);
            }
            return resolve(`https://projectpokemon.org/images/normal-sprite/${pokemon.name}.gif`);
        })
    })
}

function findEmoji(name, guildId) {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return null;
    return guild.emojis.cache.find(emoji => emoji.name === name);
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// function for read json file in user directory named with user id and return the json
function readJsonFile(userId) {
    return new Promise((resolve, reject) => {
        fs.readFile(`./users/${userId}.json`, (err, data) => {
            if (err)
                return reject(err);
            return resolve(JSON.parse(data));
        })
    })
}

// function for create defaut json user with id. the default json contain an empty pokedex array, timer to catch set to timestamp now and level set to 1
function createJsonFile(userId) {
    return new Promise((resolve, reject) => {
        const json = {
            pokedex: {},
            timer: Date.now(),
            level: 1,
            xp: 0
        }
        saveJsonFile(userId, json).then(() => {
            resolve();
        }).catch(error => {
            reject(error);
        })
    })
}

// function to return the difference between now and time of timer in json file
function getTimer(userId) {
    return new Promise((resolve, reject) => {
        readJsonFile(userId).then(json => {
            return resolve(json.timer - Date.now());
        }).catch(error => {
            reject(error);
        })
    })
}

// function to set 15 minute to time of now in json file
function setTimer(userId) {
    return new Promise((resolve, reject) => {
        readJsonFile(userId).then(json => {
            json.timer = Date.now() + 15 * 60 * 1000;
            saveJsonFile(userId, json).then(() => {
                resolve();
            }).catch(error => {
                reject(error);
            })
        }).catch(error => {
            reject(error);
        })
    })
}

// function to check if file exist with user id name in users folders
function fileExist(userId) {
    return new Promise((resolve, reject) => {
        fs.access(`./users/${userId}.json`, fs.constants.F_OK, (err) => {
            if (err)
                return resolve(false);
            return resolve(true);
        })
    })
}

// function for save json in user directory file named by user id
function saveJsonFile(userId, json) {
    return new Promise((resolve, reject) => {
        fs.writeFile(`./users/${userId}.json`, JSON.stringify(json, null, 4), (err) => {
            if (err)
                return reject(err);
            return resolve();
        })
    })
}

// function for read json file in user directory named with user id and add pokemon id to pokedex array
function addPokemonToPokedex(userId, pokemonId, isShiny) {
    return new Promise((resolve, reject) => {
        readJsonFile(userId).then(async json => {
            P.getPokemonByName(pokemonId).then(async pokemon => {
                let is_shiny = isShiny
                if (!json.pokedex.pokemonId)
                    json.pokedex[pokemonId] = [];
                json.pokedex[pokemonId].push({name: pokemon.name, rarity: await getRarity(pokemonId), is_shiny: is_shiny});
                saveJsonFile(userId, json).then(() => {
                    resolve();
                }).catch(error => {
                    reject(error);
                })
            }).catch(error => {
                reject(error);
            });
        }).catch(error => {
            reject(error);
        })
    })
}

// function get date given to minute and second string
function getDate(date) {
    return new Date(date).toLocaleString('fr-FR', {
        minute: 'numeric',
        second: 'numeric',
        hour24: true
    });
}

// function to calcul xp needed for level up in minecraft
function getXpNeeded(level) {

}

async function getRarity(id) {
    return P.getPokemonSpeciesByName(id).then(response => {
        if (response.is_mythical)
            return "DARK_PURPLE";
        else if (response.is_legendary)
            return "GOLD";
        else if (response.is_baby)
            return "GREEN";
        return "BLUE";
    }).catch(err => {
       return "RED";
    });
}

async function getPokemonId() {
    let id = getRandomFromArray(idArray);
    if (await getRarity(id) === "RED")
        if (getRandomIntInclusive(1, 100) <= 20)
            return id;
        else
            return getPokemonId();
    if (await getRarity(id) === "GREEN")
        if (getRandomIntInclusive(1, 100) <= 80)
            return id;
        else
            return getPokemonId();
    if (await getRarity(id) === "GOLD")
        if (getRandomIntInclusive(1, 100) <= 30)
            return id;
        else
            return getPokemonId();
    if (await getRarity(id) === "DARK_PURPLE")
        if (getRandomIntInclusive(1, 100) <= 50)
            return id;
        else
            return getPokemonId();
    return id;
}

function isShiny() {
    return getRandomIntInclusive(1, 100) === 5;
}

async function catchPokemon(interaction) {

    if (idArray.length === 0)
        idArray = await getIdArray();
    if (await getTimer(interaction.user.id) < 0) {
        await setTimer(interaction.user.id);
        let id = await getPokemonId();
        let shiny = isShiny();
        P.getPokemonByName(id).then(async (pokemon) => {
            addPokemonToPokedex(interaction.user.id, id, shiny).then(() => {
                getSprite(pokemon, shiny).then(async (sprite) => {
                    getRarity(id).then(async (rarity) => {
                        let title = (shiny) ? `${pokemon.name} ${findEmoji("shiny", config.guildId)}` : `${pokemon.name}`;
                        const embed = new MessageEmbed()
                            .setTitle(title)
                            .setDescription(`**Type:** ${pokemon.types.map(type => type.type.name).join(', ')}\n**Weight:** ${pokemon.weight}kg\n**Height:** ${pokemon.height}m`)
                            .setColor(rarity)
                            .setImage(sprite)
                        await interaction.editReply({embeds: [embed]});
                    }).catch(error => {
                        console.log(error);
                    });
                }).catch(async error => {
                    const embed = new MessageEmbed()
                        .setTitle(`Sorry, an error occured`)
                        .setColor("DARK_RED")
                        .setDescription(`${error}`)
                    await interaction.editReply({embeds: [embed]});
                });
            });
        }).catch(error => {
            console.error(error);
        });
    } else {
        getTimer(interaction.user.id).then(async (time) => {
            const embed = new MessageEmbed()
                .setTitle(`You have to wait ${getDate(time)}`)
                .setColor("WHITE")
            await interaction.editReply({embeds: [embed]});
        });
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('catch')
        .setDescription('Catch random pokemon!'),
    /**
     *
     * @param {CommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        await interaction.deferReply();
                fileExist(interaction.user.id).then(async (result) => {
            if (!result)
                createJsonFile(interaction.user.id).then(async () => {
                   await catchPokemon(interaction);
                });
            else
                await catchPokemon(interaction);
        }).catch(error => {
           console.log(error);
        });
    },
};