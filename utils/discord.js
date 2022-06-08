function findEmoji(name, guildId) {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return null;
    return guild.emojis.cache.find(emoji => emoji.name === name);
}

exports.findEmoji = findEmoji;
