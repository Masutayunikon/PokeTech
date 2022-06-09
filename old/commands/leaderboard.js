module.exports = {
    name: "leaderboard",
    description: "See who has the higher number of catched pokemon",
    usage: "leaderboard",
    aliases: ["ld"],
    permissions: [],
    async execute(msg, args) {
        try {
            const fs = require("fs");
            const config = require("../config.json");
            const {MessageEmbed} = require("discord.js");

            let users = [];
            let dir = fs.readdirSync("./users/", "UTF-8");
            dir.forEach(value => {
                let user = require(`../users/${value}`);
                let legendary = 0;
                for (let i = 0; i < user.pokedex.length; i++)
                    if (config.legendary_array.includes(user.pokedex[i], 0))
                        legendary++;
                let json = {
                    id: user.discord_id,
                    pc_size: user.pokedex.length,
                    username: user.username,
                    legendary: legendary,
                    pokedex: user.pokedex_completion
                }
                users.push(json);
            })
            users.sort((a, b) => { return b.pokedex - a.pokedex; })
            let str_user = ""
            for (let i = 0; i < users.length; i++)
                str_user += `**${users[i].username}** - Pokédex: ${users[i].pokedex} ` + "`" + users[i].pc_size + "`" + `- Legendary: **${users[i].legendary}**\n`;
            msg.channel.send(new MessageEmbed({
                color: "BLUE",
                title: "Catcher - Pokedex Completion",
                description: str_user
            })).catch(err => console.log(err));
        } catch (err) {
            msg.channel.send("No user are registered");
        }
    }
}