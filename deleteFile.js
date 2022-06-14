const fs = require('fs');

// function for list all files in assets folders
function listFiles(dir, files_) {
    files_ = files_ || [];
    let files = fs.readdirSync(dir);
    for (let i in files) {
        let name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
            listFiles(name, files_);
        } else {
            files_.push(name);
        }
    }
    // for each file in files_ if it contains any number delete him
    for (let i in files_) {
        if (containsNumber(files_[i])) {
            fs.unlinkSync(files_[i]);
            console.log(`${files_[i]} deleted`);
        }
    }
}

// function to check if string contains any number
function containsNumber(str) {
    return /\d/.test(str);
}

// create json file and save object in
function createJsonFile(dir, object) {
    fs.writeFileSync(dir, JSON.stringify(object, null, 4));
}

function listFiles_(dir, files_) {
    files_ = files_ || [];
    let files = fs.readdirSync(dir);
    for (let i in files) {
        let name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
            listFiles(name, files_);
        } else {
            files_.push(files[i]);
        }
    }
    let object = {};
    for (let i in files_) {
        object[files_[i]] = { "level": -1, "path": `./assets/${files_[i]}` };
        console.log(object[files_[i]]);
    }
    createJsonFile(`sprite.json`, object);
}

listFiles_("./assets/profil");