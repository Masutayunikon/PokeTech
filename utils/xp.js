const {readJsonFile, saveJsonFile} = require("./files");

function xpNeeded(level) {
    return Math.ceil(level * 1.5 * (level + 1));
}

function getProgressBar(level, xp) {
    let xp_need = xpNeeded(level + 1);
    let xp_per_bar = xp_need / 10;
    for (let i = 0; i < 10; i++) {
        if (xp_per_bar * (i + 1) >= xp)
            return i;
    }
    return 10;
}

async function giveUserXp(userId, xp) {
    return new Promise((resolve, reject) => {
        readJsonFile(userId).then(async json => {
            json.xp += xp;
            if (json.xp >= xpNeeded(json.level + 1)) {
                json.xp -= xpNeeded(json.level + 1);
                json.level++;
            }
            saveJsonFile(userId, json).then(() => {
                resolve();
            }).catch(error => {
                reject(error);
            });
        }).catch(error => {
            reject(error);
        });
    });
}

async function getXpByRarity(rarity) {
    if (rarity === "BLUE")
        return 10;
    if (rarity === "GREEN")
        return 12;
    if (rarity === "GOLD")
        return 30;
    if (rarity === "DARK_PURPLE")
        return 20;
    if (rarity === "RED")
        return 35;
}

exports.xpNeeded = xpNeeded;
exports.getProgressBar = getProgressBar;
exports.giveUserXp = giveUserXp;
exports.getXpByRarity = getXpByRarity;