const fs = require("fs");

function create_new_user(msg) {
    let user_id = msg.author.id;
    let new_user_json = {
        "discord_id": user_id,
        "user_number": 0,
        "pokedex": [],
        "pokedex_completion": 0,
        "username": msg.author.username,
        "notification": true
    }

    fs.writeFile(`./users/${msg.author.id}.json`, JSON.stringify(new_user_json, null, 2), (err) => {
        if (err)
            console.log("Error to save json file");
        else
            console.log("Save new users json files.");
    });
}

module.exports = {
    name: "register",
    description: "Register new user",
    usage: "register",
    aliases: ["r"],
    permissions: [],
    async execute(msg, args) {
        if (fs.existsSync(`./users/${msg.author.id}.json`))
            msg.channel.send(`<@${msg.author.id}> you have already an account.`)
        else {
            create_new_user(msg);
            msg.channel.send(`<@${msg.author.id}> your account was created with success =D!`);
        }
    }
}