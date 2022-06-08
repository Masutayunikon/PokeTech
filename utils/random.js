function getRandomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

exports.getRandomIntInclusive = getRandomIntInclusive;
exports.getRandomFromArray = getRandomFromArray;