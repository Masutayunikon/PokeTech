const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');
const Pokedex = require('pokedex-promise-v2')
const P = new Pokedex();

async function getIdArray() {
    let result = [];
    const interval = {
        limit: 10000,
        offset: 0
    }
    await P.getPokemonsList(interval)
        .then((response) => {
            console.log(response.results);
            for (let items in response.results) {
                let _split = response.results[items].url.split("/");
                result.push(Number(_split[_split.length - 2]));
            }
        })
    P.getPokemonByName(result[150]).then( res => {
        console.log(res);
    }).catch(error => {console.log(error)});
    return result;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('catch')
        .setDescription('Catch pokemon!'),
    /**
     *
     * @param {CommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        await getIdArray();
        interaction.reply("lol");
    },
};