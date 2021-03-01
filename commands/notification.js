module.exports = {
    name: "notification",
    description: "Enable or disable notification when you can catch",
    usage: "notification",
    aliases: ["notif"],
    permissions: [],
    async execute(msg, args) {
        const fs = require("fs");
        const {refresh_user_json} = require("../users_utils.js");

        if (!fs.existsSync(`./users/${msg.author.id}.json`))
            msg.channel.send(`<@${msg.author.id}> you are not registered.`).catch(err => console.error(err));
        else {
            let this_user = require(`../users/${msg.author.id}.json`);
            if (!this_user.notification) {
                this_user.notification = true;
                msg.author.send("Hello PokeUsers =D!").catch(a => {
                    if (a.code === 50007) {
                        msg.reply("Can't send DM to your user because is disabled!");
                        this_user.notification = false
                    }
                });
                if (this_user.notification)
                    msg.reply("I send you private message =D");
            } else if (this_user.notification) {
                this_user.notification = false;
                msg.channel.send(`<@${msg.author.id}>, I disabled private message with you, goodbye my friend...`);
            }

            if (refresh_user_json(msg.author.id) === -1)
                console.log(`An error for save pokemon ${msg.author.id} json files!`);
            else
                console.log(`Saving ${msg.author.id} json files with success.`);
        }
    }
}