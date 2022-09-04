const {SlashCommandBuilder} = require("@discordjs/builders");
const { CommandInteraction, MessageEmbed} = require('discord.js');
const {fileExist, createJsonFile, getJsonObjectFromFile, saveJsonObjectToFile} = require("../utils/files");
const {getRarity, addPokemonToPokedex, getSprite} = require("../utils/pokemon");
const {getRandomIntInclusive} = require("../utils/random")
const {findEmoji} = require("../utils/discord");
const {getXpByRarity, giveUserXp} = require("../utils/xp");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gift')
        .setDescription('Try to take the gift (3 hours cooldown)'),
    /**
     *
     * @param {CommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        await interaction.deferReply("Create gift...");
        let eventJson = await getJsonObjectFromFile("./events.json");
        if (Date.now() >= eventJson.hourly_give.last) {
            let index = getRandomIntInclusive(0, idArray.length - 1);
            let rarity = await getRarity(idArray[index]);
            while (rarity !== "GOLD" && rarity !== "DARK_PURPLE") {
                index = getRandomIntInclusive(0, idArray.length);
                rarity = await getRarity(idArray[index]);
            }
            let id = idArray[index];
            let shiny = false;
            if (getRandomIntInclusive(1, 100) <= 50)
                shiny = true;
            console.log(index, idArray[index], rarity, shiny);
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
            console.log("hmmm");
        }
    },
};