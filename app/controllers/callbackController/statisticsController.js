const csv = require("fast-csv");
const fs = require("fs");
const tmp = require("tmp");

const myCars = [{
    "car": "Audi",
    "price": 40000,
    "color": "blue",
}, {
    "car": "BMW",
    "price": 35000,
    "color": "black",
}, {
    "car": "Porsche",
    "price": 60000,
    "color": "green",
}];

function tmpFile(prefix, postfix, callback) {
    tmp.file({ mode: 0644, prefix, postfix }, function _tempFileCreated(err, path, fd, cleanup) {
        if (err) throw err;
        console.log('File: ', path);
        callback(path, fd, cleanup);
    });
}

exports.csv = (ctx) => {
    tmpFile("users-", ".csv", (path, fd, cleanup) => {
        csv
            .writeToPath(path, myCars, { headers: true })
            .on("finish", async(error) => {
                console.log("done!");
                await ctx.replyWithDocument({ source: path });
                cleanup();
            });
    });
};

exports.json = (ctx) => {
    tmpFile("users-", ".json", (path, fd, cleanup) => {
        fs.writeFile(path, JSON.stringify(myCars), async(err) => {
            await ctx.replyWithDocument({ source: path });
            cleanup();
        });
    });
}

exports.xlsx = (ctx) => {
    tmpFile("users-", ".xlsx", (path, fd, cleanup) => {
        fs.writeFile(path, result, async(err) => {
            await ctx.replyWithDocument({ source: path });
            cleanup();
        });
    });
}