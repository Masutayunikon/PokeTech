module.exports = {
    name: "patch",
    description: "Display list of patch notes",
    usage: "patch",
    hasAlias: true,
    aliases: ["p"],
    permissions: [],
    async execute(msg, args) {
        msg.channel.send(`<@${msg.author.id}>\n` +
            "```" +
            "Here are my patch notes\n" +
            "17/02/2021 bot launched\n" +
            "18/02/2021 Legendary pokemon is now write in bold in pokedex\n" +
            "18/02/2021 You can see another player pokedex with ^pokedex @name\n" +
            "18/02/2021 You can see your pokemon with ^pc\n" +
            "19/02/2021 Adding leaderboard ^leaderboard\n" +
            "***in progress*** You can exchange your pokemon with your friend" +
            "```");
    }
}