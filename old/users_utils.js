module.exports = {
    refresh_user_json(id) {
        const fs = require("fs");

        let this_user = require(`./users/${id}.json`);
        fs.writeFile(`./users/${id}.json`, JSON.stringify(this_user, null, 2), (err) => {
            if (err)
                return (-1)
        });
        return (1);
    }
}