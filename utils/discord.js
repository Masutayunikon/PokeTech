function findEmoji(name) {
    return client.emojis.cache.find(emoji => emoji.name === name);
}

exports.findEmoji = findEmoji;
