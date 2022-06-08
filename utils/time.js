const { readJsonFile, saveJsonFile } = require('./files');

function getTimer(userId) {
    return new Promise((resolve, reject) => {
        readJsonFile(userId).then(json => {
            return resolve(json.timer - Date.now());
        }).catch(error => {
            reject(error);
        })
    })
}

function getDate(date) {
    return new Date(date).toLocaleString('fr-FR', {
        minute: 'numeric',
        second: 'numeric',
        hour24: true
    });
}

// function to set 15 minute to time of now in json file
function setTimer(userId) {
    return new Promise((resolve, reject) => {
        readJsonFile(userId).then(json => {
            json.timer = Date.now() + 15 * 60 * 1000;
            saveJsonFile(userId, json).then(() => {
                resolve();
            }).catch(error => {
                reject(error);
            })
        }).catch(error => {
            reject(error);
        })
    })
}

exports.setTimer = setTimer;
exports.getDate = getDate;
exports.getTimer = getTimer;
