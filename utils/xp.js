function xpNeeded(level) {
    return Math.ceil(level * 1.5 * (level + 1));
}

function getProgressBar(level, xp) {
    let xp_need = xpNeeded(level + 1);
    let xp_per_bar = xp_need / 10;
    for (let i = 0; i < 10; i++) {
        console.log(xp_per_bar * (i + 1), xp);
        if (xp_per_bar * (i + 1) >= xp)
            return i;
    }
    return 10;
}

exports.xpNeeded = xpNeeded;
exports.getProgressBar = getProgressBar;