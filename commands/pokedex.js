const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, CommandInteraction, MessageButton, MessageEmbed } = require('discord.js');
const fs = require('fs');
const { guildId } = require('../config.json');

function findEmoji(name, guildId) {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return null;
    return guild.emojis.cache.find(emoji => emoji.name === name);
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
    const filePath = `./users/${userId}.json`;
    let user = JSON.parse(fs.readFileSync(filePath));
    let pokedex = [];
    for (let i = 0; i < idArray.length; i++) {
        let pokemon = user.pokedex[idArray[i]];
        if (pokemon) {
            pokedex.push(`${i + 1} ${pokemon[0].name}`)
        } else {
            pokedex.push(`${i + 1} ?????`)
        }
    }
    return pokedex;
}

// check if file exists in users folder
function checkUser(userId) {
    const filePath = `./users/${userId}.json`;
    return fs.existsSync(filePath);
}

// function for sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pokedex')
        .setDescription('Show user pokedex')
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
        let pokedex = await getPokedex((interaction.options.getUser("user")) ? interaction.options.getUser("user").id : interaction.user.id);
        let pages = Math.ceil(pokedex.length / 20);
        let page = (interaction.options.getNumber("page") != null) ? ((interaction.options.getNumber("page") > pages) ? pages : ((interaction.options.getNumber("page") < 1) ? 1 : interaction.options.getNumber("page"))) : 1;
        let pagination = pokedex.slice((page - 1) * 20, page * 20).join("\n");
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId(`${interaction.user.id}-pokedex-prev`)
                    .setEmoji('⬅')
                    .setLabel('')
                    .setStyle('PRIMARY')
                    .setDisabled(page === 1),
                new MessageButton()
                    .setCustomId(`${interaction.user.id}-pokedex-next`)
                    .setLabel('')
                    .setEmoji('➡')
                    .setStyle('DANGER')
                    .setDisabled(page === pages),
            );

        const embed = new MessageEmbed()
            .setTitle(`${interaction.user.username}'s Pokedex`)
            .setFooter({ text: `Page ${page}/${pages}` })
            .setDescription(pagination);

        let filter = i => i.customId === `${interaction.user.id}-pokedex-prev` || i.customId === `${interaction.user.id}-pokedex-next`;
        const collector = interaction.channel.createMessageComponentCollector({filter,  time: 5 * 60 * 1000 });

        collector.on('collect', async i => {
            if (i.customId === `${interaction.user.id}-pokedex-prev`) {
                if (page > 1)
                    page--;
            } else if (i.customId === `${interaction.user.id}-pokedex-next`) {
                if (page < pages)
                    page++;
            }
            pagination = pokedex.slice((page - 1) * 20, page * 20).join("\n");
            embed.setDescription(pagination);
            embed.setFooter({ text: `Page ${page}/${pages}` });

            const row_edit = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId(`${interaction.user.id}-pokedex-prev`)
                        .setEmoji('⬅')
                        .setLabel('')
                        .setStyle('PRIMARY')
                        .setDisabled(page === 1),
                    new MessageButton()
                        .setCustomId(`${interaction.user.id}-pokedex-next`)
                        .setLabel('')
                        .setEmoji('➡')
                        .setStyle('DANGER')
                        .setDisabled(page === pages),
                );
            await i.update({ embeds: [embed], components: [row_edit] });
        });

        collector.on('end', collected => console.log(`Collected ${collected.size} items`));
        await interaction.reply({ embeds: [embed], ephemeral: true, components: [row] });
    },
};