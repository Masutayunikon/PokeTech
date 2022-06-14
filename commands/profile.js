const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, MessageAttachment } = require('discord.js');
const Canvas = require("@napi-rs/canvas");
const { readFile } = require('fs');
const { getUserPokedex, getPokedex } = require('../utils/pokemon');
const { xpNeeded, getProgressBar } = require('../utils/xp');
const { readJsonFile, checkUserExist} = require('../utils/files');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Show your profile')
        .addUserOption(user => user.setName("user").setDescription("The user to show the profile of")),
    /**
     *
     * @param {CommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        let user;
        if (interaction.options.getUser("user") != null) {
            user = interaction.options.getUser("user");
        } else
            user = interaction.user;
        if (!checkUserExist(user.id)) {
            interaction.reply("User has no profile yet!");
            return;
        }
        await interaction.deferReply();
        let json = await readJsonFile(user.id);
        const canvas = Canvas.createCanvas(700, 300);
        const context = canvas.getContext("2d");
        // load image ./assets/background.png
        readFile("./assets/dracaufeu-background.jpg", async (err, backgroundBuffer) => {
            if (err) {
                await interaction.editReply("An error occurred");
                return;
            }
            const background = new Canvas.Image();
            background.src = backgroundBuffer;
            context.drawImage(background, 0, 0, canvas.width, canvas.height);
            readFile("./assets/Pokedex.png", async (err, pokedexBuffer) => {
                if (err) {
                    await interaction.editReply("An error occurred");
                    return;
                }
                const pokedex = new Canvas.Image();
                pokedex.src = pokedexBuffer;
                readFile("./assets/profil/aaron.png", async (err, spriteBuffer) => {
                    if (err) {
                        await interaction.editReply("An error occurred");
                        return;
                    }
                    const sprite = new Canvas.Image();
                    sprite.src = spriteBuffer;
                    context.drawImage(pokedex, 200, 200, 450, 200);
                    context.drawImage(sprite, 0, 0, 200, 300);
                    readFile("./assets/level.png", async (err, levelBuffer) => {
                        if (err) {
                            await interaction.editReply("An error occurred");
                            return;
                        }
                        const level = new Canvas.Image();
                        level.src = levelBuffer;
                        readFile("./assets/no-level.png", async (err, noLevelBuffer) => {
                            if (err) {
                                await interaction.editReply("An error occurred");
                                return;
                            }
                            const noLevel = new Canvas.Image();
                            noLevel.src = noLevelBuffer;
                            // write interaction.user.tag in the canvas

                            context.font = "30px serif";
                            context.fillStyle = "black";
                            let level_x = 0;
                            if (json.level.toString().length === 1)
                                level_x = 210;
                            else if (json.level.toString().length === 2)
                                level_x = 200;
                            else if (json.level.toString().length === 3)
                                level_x = 190;
                            let pokedexCompletion = getUserPokedex(user.id).length;
                            context.fillText(user.tag, 250, 50);
                            context.fillText(json.level.toString(), level_x, 150);
                            context.fillText(`${pokedexCompletion} / ${(await getPokedex(user.id)).length}`, 350, 250);
                            context.font = "25px serif";
                            context.fillText(`${json.xp} / ${xpNeeded(json.level + 1)} xp`, 400, 180);
                            let xp = getProgressBar(json.level, json.xp);
                            for (let i = 0; i < 10; i++)
                                if (i <= xp)
                                    context.drawImage(level, 250 + i * 40, 130, 40, 20);
                                else
                                    context.drawImage(noLevel, 250 + i * 40, 130, 40, 20);
                            context.fillStyle = "rgba(0, 0, 0, 0.3)";
                            context.beginPath();
                            context.arc(215, 137, 50, 0, 2 * Math.PI);
                            context.fill();
                            const attachment = new MessageAttachment(canvas.toBuffer(), "profile.png");
                            await interaction.editReply({content: null, files: [attachment]});
                        });
                    });
                });
            });
        });
    },
};