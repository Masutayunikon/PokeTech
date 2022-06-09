const fs = require('fs');
const request = require('request');
const sprites = require('./profile_sprite.json');

let download = function(uri, filename, callback){
    request.head(uri, function(err, res){
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

for (let i in sprites.sprite) {
    download(`${sprites.url}/${sprites.sprite[i].image}`, `./assets/${sprites.sprite[i].image}`, function(){
        console.log(`done ${sprites.sprite[i].image}`);
    });
}