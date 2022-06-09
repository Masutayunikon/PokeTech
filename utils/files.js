const fs = require('fs');

function readJsonFile(userId) {
    return new Promise((resolve, reject) => {
        fs.readFile(`./users/${userId}.json`, (err, data) => {
            if (err)
                return reject(err);
            return resolve(JSON.parse(data));
        })
    })
}

function createJsonFile(userId) {
    return new Promise((resolve, reject) => {
        const json = {
            pokedex: {},
            timer: Date.now(),
            level: 0,
            xp: 0
        }
        saveJsonFile(userId, json).then(() => {
            resolve();
        }).catch(error => {
            reject(error);
        })
    })
}

function fileExist(userId) {
    return new Promise((resolve) => {
        fs.access(`./users/${userId}.json`, fs.constants.F_OK, (err) => {
            if (err)
                return resolve(false);
            return resolve(true);
        })
    })
}

function checkUserExist(userId) {
    const filePath = `./users/${userId}.json`;
    return fs.existsSync(filePath);
}

function saveJsonFile(userId, json) {
    return new Promise((resolve, reject) => {
        fs.writeFile(`./users/${userId}.json`, JSON.stringify(json, null, 4), (err) => {
            if (err)
                return reject(err);
            return resolve();
        })
    })
}


exports.checkUserExist = checkUserExist;
exports.saveJsonFile = saveJsonFile;
exports.readJsonFile = readJsonFile;
exports.fileExist = fileExist;
exports.createJsonFile = createJsonFile;