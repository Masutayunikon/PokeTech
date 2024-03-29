const fs = require('fs');
const { guildId } = require('../config.json');
const config = require('../config.json');
const { findEmoji } = require('../utils/discord.js');
const { readJsonFile, saveJsonFile } = require('../utils/files');
const request = require('request');
const { MessageEmbed } = require('discord.js');
const { getRandomIntInclusive, getRandomFromArray } = require('../utils/random');
const { getDate, getTimer, setTimer } = require('../utils/time');
const { getXpByRarity, giveUserXp } = require('../utils/xp');

function readUserPokemon(userId) {
    const filePath = `./users/${userId}.json`;
    let pokemons = [];
    let user = JSON.parse(fs.readFileSync(filePath));
    for (const [key, value] of Object.entries(user.pokedex)) {
        let pokemon_name = "";
        let number = 0;
        for (const pokemon of value) {
            if (pokemon.is_shiny) {
                let shiny_pokemon_name = `${key} ${pokemon.name} ${findEmoji("shiny")}`;
                pokemons.push(shiny_pokemon_name);
            } else {
                number++;
                pokemon_name = `${key} ${pokemon.name} x${number}`;
            }
        }
        pokemons.push(pokemon_name);
    }
    return pokemons;
}

function getUserPokedex(userId) {
    const filePath = `./users/${userId}.json`;
    let pokemons = [];
    let user = JSON.parse(fs.readFileSync(filePath));
    for (const [key] of Object.entries(user.pokedex)) {
        pokemons.push(`${key}`);
    }
    return pokemons;
}

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

async function getPokedex(userId) {
    if (idArray.length === 0)
        idArray = await getIdArray();
    let user = await readJsonFile(userId);
    let pokedex = [];
    for (let i = 0; i < idArray.length; i++) {
        let pokemon = user.pokedex[idArray[i].toString()];
        if (pokemon) {
            pokedex.push(`${i + 1} ${pokemon[0].name}`)
        } else {
            pokedex.push(`${i + 1} ?????`)
        }
    }
    return pokedex;
}

function getSprite(pokemon, shiny) {
    if (shiny) {
        return new Promise((resolve, reject) => {
            request(`https://play.pokemonshowdown.com/sprites/ani-shiny/${pokemon.name}.gif`, (error, response) => {
                if (error)
                    return resolve(pokemon.sprites.front_shiny);
                if (response.statusCode === 404)
                    return resolve(pokemon.sprites.front_shiny);
                return resolve(`https://play.pokemonshowdown.com/sprites/ani-shiny/${pokemon.name}.gif`);
            })
        })
    }
    return new Promise((resolve, reject) => {
        request(`https://play.pokemonshowdown.com/sprites/ani/${pokemon.name}.gif`, (error, response) => {
            if (error)
                return resolve(pokemon.sprites.front_default);
            if (response.statusCode === 404) {
                if (pokemon.sprites.front_default)
                    return resolve(pokemon.sprites.front_default);
                return resolve(pokemon.sprites.versions["generation-viii"]["icons"].front_default);
            }
            return resolve(`https://play.pokemonshowdown.com/sprites/ani/${pokemon.name}.gif`);
        })
    })
}

function addPokemonToPokedex(userId, pokemonId, isShiny) {
    return new Promise((resolve, reject) => {
        readJsonFile(userId).then(async json => {
            P.getPokemonByName(pokemonId).then(async pokemon => {
                let is_shiny = isShiny;
                if (json.pokedex[pokemonId] === undefined) {
                    console.log("in");
                    json.pokedex[pokemonId] = [];
                }
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

async function getRarity(id) {
    return P.getPokemonSpeciesByName(id).then(response => {
        if (response.is_mythical)
            return "DARK_PURPLE";
        else if (response.is_legendary)
            return "GOLD";
        else if (response.is_baby)
            return "GREEN";
        return "BLUE";
    }).catch(() => {
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
    if (await getTimer(interaction.user.id) < 0) {
        await interaction.deferReply("Catching...");
        await setTimer(interaction.user.id);
        let id = await getPokemonId();
        let shiny = isShiny();
        P.getPokemonByName(id).then(async (pokemon) => {
            addPokemonToPokedex(interaction.user.id, id, shiny).then(() => {
                getSprite(pokemon, shiny).then(async (sprite) => {
                    getRarity(id).then(async (rarity) => {
                        let title = (shiny) ? `${pokemon.name} ${findEmoji("shiny")}` : `${pokemon.name}`;
                        let xp = await getXpByRarity(rarity);
                        if (shiny)
                            xp += 10;
                        const embed = new MessageEmbed()
                            .setTitle(title)
                            .setDescription(`**Id:** ${pokemon.id}\n**Type:** ${pokemon.types.map(type => type.type.name).join(', ')}\n**Xp:** ${xp} ${findEmoji("xp")}`)
                            .setColor(rarity)
                            .setImage(sprite)
                        await interaction.editReply({embeds: [embed]});
                        await giveUserXp(interaction.user.id, xp);
                    }).catch(async error => {
                        const embed = new MessageEmbed()
                            .setTitle("Something went wrong")
                            .setColor("DARK_RED")
                            .setDescription(`${error}`)
                        await interaction.editReply({embeds: [embed]});
                    });
                }).catch(async error => {
                    const embed = new MessageEmbed()
                        .setTitle(`Sorry, an error occured`)
                        .setColor("DARK_RED")
                        .setDescription(`${error}`)
                    await interaction.editReply({embeds: [embed]});
                });
            }).catch( async error => {
                const embed = new MessageEmbed()
                    .setTitle(`Sorry, an error occured`)
                    .setColor("DARK_RED")
                    .setDescription(`${error}`)
                await interaction.editReply({embeds: [embed]});
            });
        }).catch(error => {
            console.error(error);
        });
    } else {
        getTimer(interaction.user.id).then(async (time) => {
            const embed = new MessageEmbed()
                .setTitle(`You have to wait ${getDate(time)}`)
                .setColor("WHITE")
            await interaction.reply({embeds: [embed], ephemeral: true});
        });
    }
}

exports.catchPokemon = catchPokemon;
exports.isShiny = isShiny;
exports.getPokemonId = getPokemonId;
exports.readUserPokemon = readUserPokemon;
exports.getRarity = getRarity;
exports.addPokemonToPokedex = addPokemonToPokedex;
exports.getSprite = getSprite;
exports.getIdArray = getIdArray;
exports.getPokedex = getPokedex;
exports.getUserPokedex = getUserPokedex;
