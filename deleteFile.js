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

listFiles("./assets");
