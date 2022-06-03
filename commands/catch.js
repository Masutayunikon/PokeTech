const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');
const Pokedex = require('pokedex-promise-v2')
const P = new Pokedex();
const request = require('request');

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
function getSprite(pokemon) {
    return new Promise((resolve, reject) => {
        request(`https://projectpokemon.org/images/normal-sprite/${pokemon.name}.gif`, (error, response, body) => {
            if (error)
                return reject(error);
            if (response.statusCode === 404)
                return resolve(pokemon.sprites.front_default);
            return reject(response.statusCode);
        })
    })
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
        let id = getRandomFromArray(await getIdArray());
        interaction.reply("Catching...");
        P.getPokemonByName(id).then(async (pokemon) => {
            getSprite(pokemon).then(async (sprite) => {
                interaction.editReply(sprite);
            }).catch(error => {
                interaction.editReply(pokemon.sprites.front_default);
            });
        }).catch(error => {
            console.error(error);
        });
    },
};