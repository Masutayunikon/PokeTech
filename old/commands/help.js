module.exports = {
    name: "help",
    description: "Display list of commands",
    usage: "help",
    aliases: ["h"],
    permissions: [],
    async execute(msg, args) {
        const data = [];
        const {commands} = msg.client;
        const {MessageEmbed} = require("discord.js");
        const {prefix} = require('../config.json');

        commands.forEach((value, key) => {
            let val = `${value.description}\n➳ The syntax is : \`${prefix}${value.usage}\``;
            if (value.aliases.length)
                val += `\n➳ Alias \`${value.aliases.join(', ')}\``
            data.push({
                name: key,
                value: val
            })
        });
        msg.channel.send(new MessageEmbed({
            color: "BLUE",
            title: "Here are my commands:",
            timestamp: new Date(),
            fields: data
        }).setFooter("Poketech.io - Commands").setThumbnail(msg.client.user.avatarURL({dynamic: true}))).catch(err => console.log(err));
    },
};