const {MessageEmbed} = require("discord.js");
const rm = require('discord.js-reaction-menu')

module.exports = {
    async send_menu(arr, this_user, first, msg, rest, is_pc, page_arg) {
        let footer = is_pc ? `Pokemon: ${this_user.pokedex.length}` : `completion: ${this_user.pokedex_completion}/649`;
        let page = 2;
        arr.push(new MessageEmbed({
            title: `page ${1}`,
            description: `${first}`
        }).setFooter(footer));

        for (const text of rest) {
            arr.push(new MessageEmbed({
                title: `page ${page}`,
                description: `${text}`
            }).setFooter(footer));
            page++;
        }

        if (page_arg > page || page_arg <= 0)
            msg.channel.send("Cannot get the page !").catch(err => console.log(err));
        else {
            new rm.menu({
                channel: msg.channel,
                userID: msg.author.id,
                pages: arr,
                page: page_arg - 1
            });
        }
    }
}