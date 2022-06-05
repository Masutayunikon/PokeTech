const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, MessageEmbed, ColorResolvable, EmojiResolvable } = require('discord.js');
const Pokedex = require('pokedex-promise-v2')
const P = new Pokedex();
const request = require('request');
const fs = require('fs');

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
    console.log(result.length);
    return result;
}

function getRandomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// check if url https://projectpokemon.org/images/normal-sprite/${pokemon.name}.gif return 404 if yes return pokemon.sprites.front_default url string
function getSprite(pokemon) {
    return new Promise((resolve, reject) => {
        request(`https://projectpokemon.org/images/normal-sprite/${pokemon.name}.gif`, (error, response, body) => {
            if (error)
                return reject(error);
            if (response.statusCode === 404)
                return resolve(pokemon.sprites.front_default);
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
            pokedex: [],
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
            console.log(Date.now(), json.timer, Date.now() - json.timer, json.timer - Date.now());
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
        fs.writeFile(`./users/${userId}.json`, JSON.stringify(json), (err) => {
            if (err)
                return reject(err);
            return resolve();
        })
    })
}

// function for read json file in user directory named with user id and add pokemon id to pokedex array
function addPokemonToPokedex(userId, pokemonId) {
    return new Promise((resolve, reject) => {
        readJsonFile(userId).then(json => {
            json.pokedex.push(pokemonId);
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

// function get date given to minute and second string
function getDate(date) {
    return new Date(date).toLocaleString('fr-FR', {
        minute: 'numeric',
        second: 'numeric',
        hour24: true
    });
}

async function getRarity(id) {
    return P.getPokemonSpeciesByName(id).then(response => {
        if (response.is_mythical)
            return "VIOLET";
        else if (response.is_legendary)
            return "YELLOW";
        else if (response.is_baby)
            return "GREEN";
        return "BLUE";
    }).catch(err => {
       return "RED";
    });
}

async function catchPokemon(interaction) {
    if (await getTimer(interaction.user.id) < 0) {
        //await setTimer(interaction.user.id);
        let id = getRandomFromArray(await getIdArray());
        P.getPokemonByName(id).then(async (pokemon) => {
            addPokemonToPokedex(interaction.user.id, id).then(() => {
                getSprite(pokemon).then(async (sprite) => {
                    getRarity(id).then(async (rarity) => {
                        const embed = new MessageEmbed()
                            .setTitle(`${pokemon.name}`)
                            // set description with pokemon information
                            .setDescription(`**Type:** ${pokemon.types.map(type => type.type.name).join(', ')}\n**Weight:** ${pokemon.weight}kg\n**Height:** ${pokemon.height}m`)
                            .setColor(rarity)
                            .setImage(sprite)
                        await interaction.editReply({embeds: [embed]});
                    });
                }).catch(error => {
                    console.error(error);
                    interaction.editReply(pokemon.sprites.front_default);
                });
            });
        }).catch(error => {
            console.error(error);
        });
    } else {
        getTimer(interaction.user.id).then(async (time) => {
            const embed = new MessageEmbed()
                .setTitle(`You have to wait ${getDate(time)}`)
                .setColor("BLUE")
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