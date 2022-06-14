const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, MessageEmbed} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show all commands'),
    /**
     *
     * @param {CommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        const embed = new MessageEmbed()
            .setTitle("Help")
            .setDescription(`
            /catch - Catch a random pokemon\n
            /profile - Show your profile\n
            /help - Show all commands\n
            /showpc - Show your pokemon\n
            /pokedex - Show your pokedex\n`)
            .setColor("GREEN")
        await interaction.reply({embeds: [embed], ephemeral: true});
    },
};