const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, CommandInteraction, MessageButton, MessageEmbed } = require('discord.js');
const fs = require('fs');
const { guildId } = require('../config.json');

function findEmoji(name, guildId) {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return null;
    return guild.emojis.cache.find(emoji => emoji.name === name);
}

// read config object in users folder with user id as filename and push all array in pokedex key to one array
function readUser(userId) {
    const filePath = `./users/${userId}.json`;
    let pokemons = [];
    let user = JSON.parse(fs.readFileSync(filePath));
    for (const [key, value] of Object.entries(user.pokedex)) {
        for (const pokemon of value) {
            let pokemon_name = `${pokemon.name} ${key}`;
            if (pokemon.is_shiny) {
                let emoji = findEmoji('shiny', guildId);
                pokemon_name = `${pokemon.name} ${emoji} ${key}`;
            }
            pokemons.push(pokemon_name);
        }
    }
    return pokemons;
}

// check if file exists in users folder
function checkUser(userId) {
    const filePath = `./users/${userId}.json`;
    return fs.existsSync(filePath);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('showpc')
        .setDescription('Show user pc')
        .addUserOption(user => user.setName("user").setDescription("The user to show the pc of"))
        .addNumberOption(page => page.setName("page").setDescription("The page to show")),

    /**
     *
     * @param {CommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        if (interaction.options.getUser("user") != null) {
            if (!checkUser(interaction.options.getUser("user").id)) {
                await interaction.reply({ content: 'This user has no pc yet!', ephemeral: true });
                return;
            }
        } else if (!checkUser(interaction.user.id)) {
            await interaction.reply({ content: 'You have no pc yet!', ephemeral: true });
            return;
        }
        let pc = readUser((interaction.options.getUser("user")) ? interaction.options.getUser("user").id : interaction.user.id);
        let pages = Math.ceil(pc.length / 20);
        let page = (interaction.options.getNumber("page") != null) ? ((interaction.options.getNumber("page") > pages) ? pages : ((interaction.options.getNumber("page") < 1) ? 1 : interaction.options.getNumber("page"))) : 1;
        let pagination = pc.slice((page - 1) * 20, page * 20).join("\n");
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton().setCustomId(`${interaction.user.id}-pc-prev`).setEmoji('⬅').setLabel('').setStyle('PRIMARY').setDisabled(page === 1),
                new MessageButton().setCustomId(`${interaction.user.id}-pc-next`).setLabel('').setEmoji('➡').setStyle('DANGER').setDisabled(page === pages),
            );

        const embed = new MessageEmbed()
            .setTitle(`${interaction.user.username}'s PC`)
            .setFooter({ text: `Page ${page}/${pages}` })
            .setDescription(pagination);

        let filter = i => i.customId === `${interaction.user.id}-pc-prev` || i.customId === `${interaction.user.id}-pc-next`;
        const collector = interaction.channel.createMessageComponentCollector({filter,  time: 5 * 60 * 1000 });

        collector.on('collect', async i => {
            if (i.customId === `${interaction.user.id}-pc-prev`) {
                if (page > 1)
                    page--;
            } else if (i.customId === `${interaction.user.id}-pc-next`) {
                if (page < pages)
                    page++;
            }
            pagination = pc.slice((page - 1) * 20, page * 20).join("\n");
            embed.setDescription(pagination);
            embed.setFooter({ text: `Page ${page}/${pages}` });

            const row_edit = new MessageActionRow()
                .addComponents(
                    new MessageButton().setCustomId(`${interaction.user.id}-pc-prev`).setEmoji('⬅').setLabel('').setStyle('PRIMARY').setDisabled(page === 1),
                    new MessageButton().setCustomId(`${interaction.user.id}-pc-next`).setLabel('').setEmoji('➡').setStyle('DANGER').setDisabled(page === pages),
                );
            await i.update({ embeds: [embed], components: [row_edit] });
        });

        collector.on('end', collected => console.log(`Collected ${collected.size} items`));
        await interaction.reply({ embeds: [embed], ephemeral: true, components: [row] });
    },
};