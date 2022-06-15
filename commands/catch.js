const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');
const Pokedex = require('pokedex-promise-v2')
const { fileExist, createJsonFile } = require('../utils/files');
const { catchPokemon } = require('../utils/pokemon');

global.idArray = [];
global.P = new Pokedex();

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