module.exports = {
    name: "pc",
    description: "Display list of pokemon catched",
    usage: "pc <@player|page|id|pokemon (ongoing)>",
    aliases: ["poke"],
    permissions: [],
    async execute(msg, args) {
        let {send_menu} = require("../menu_utils.js");
        const fs = require("fs");
        const config = require("../config.json");
        const pokedex_name = require("../pokedex_name.json");
        const {Util} = require("discord.js");

        let user = msg.author.id;
        let page_arg = 1;
        if (args.length > 0) {
            if (msg.mentions.users.size) {
                user = msg.mentions.users.first().id;
                page_arg = isNaN(args[1]) ? 1 : args[1];
            } else
                page_arg = isNaN(args[0]) ? 1 : args[0];
        }
        if (!fs.existsSync(`./users/${user}.json`))
            msg.channel.send(`<@${user}> are not registered.`).catch(err => console.error(err));
        else {
            let this_user = require(`../users/${user}.json`);
            let pokedex = this_user.pokedex;
            let all_name = "";
            let arr = [];
            for (let i = 0; i < pokedex.length; i++) {
                if (config.legendary_array.includes(pokedex[i], 0))
                    all_name += `ID: ${pokedex[i]} **${pokedex_name.pokedex_name[pokedex[i] - 1]}**\n`
                else
                    all_name += `ID: ${pokedex[i]} ${pokedex_name.pokedex_name[pokedex[i] - 1]}\n`;
            }
            const [first, ...rest] = Util.splitMessage(all_name, {maxLength: 384});
            await send_menu(arr, this_user, first, msg, rest, true, page_arg);
        }
    }
}