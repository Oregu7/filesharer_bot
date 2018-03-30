const _ = require("lodash");
const csv = require("fast-csv");
const xlsx = require("node-xlsx");
const xml2js = require("xml2js");
const fs = require("fs");
const tmp = require("tmp");

const { VisitorModel } = require("../../models");

function getVisitorsMiddleware(callback) {
    return async(ctx) => {
        const users = await VisitorModel.getVisitors(ctx);
        if (users.length) return callback(ctx, users);

        return ctx.answerCbQuery("Никто не просматривал данный файл!");
    }
}

function tmpFile(prefix, postfix, callback) {
    tmp.file({ mode: 0644, prefix, postfix }, function _tempFileCreated(err, path, fd, cleanup) {
        if (err) throw err;
        callback(path, fd, cleanup);
    });
}

exports.csv = getVisitorsMiddleware((ctx, users) => {
    tmpFile("users-", ".csv", (path, fd, cleanup) => {
        csv
            .writeToPath(path, users, { headers: true })
            .on("finish", async(error) => {
                await ctx.replyWithDocument({ source: path });
                cleanup();
            });
    });
});

exports.json = getVisitorsMiddleware((ctx, users) => {
    tmpFile("users-", ".json", (path, fd, cleanup) => {
        fs.writeFile(path, JSON.stringify(users), async(err) => {
            await ctx.replyWithDocument({ source: path });
            cleanup();
        });
    });
});

exports.xlsx = getVisitorsMiddleware((ctx, users) => {
    tmpFile("users-", ".xlsx", (path, fd, cleanup) => {
        const data = [
            _.keys(users[0]),
            ...users.map((user) => _.values(user))
        ];
        const buffer = xlsx.build([{ name: "mySheetName", data: data }]);
        fs.writeFile(path, buffer, async(err) => {
            await ctx.replyWithDocument({ source: path });
            cleanup();
        });
    });
});

exports.xml = getVisitorsMiddleware((ctx, users) => {
    const builder = new xml2js.Builder();
    tmpFile("users-", ".xml", (path, fd, cleanup) => {
        const obj = {
            users: { user: users }
        };
        const xml = builder.buildObject(obj);
        fs.writeFile(path, xml, async(err) => {
            await ctx.replyWithDocument({ source: path });
            cleanup();
        });
    });
});