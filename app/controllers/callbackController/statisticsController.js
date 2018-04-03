const _ = require("lodash");
const mongoose = require("mongoose");
const Markup = require("telegraf/markup");
const csv = require("fast-csv");
const xlsx = require("node-xlsx");
const xml2js = require("xml2js");
const fs = require("fs");
const tmp = require("tmp");
const {
    STATISTICS_ACTION,
    BACK_ACTION,
} = require("config").get("constants");

const { VisitorModel, FileModel } = require("../../models");
const { deleteMessage } = require("../../helpers").fileManager;

function getVisitorsMiddleware(callback) {
    return async(ctx) => {
        const users = await VisitorModel.getVisitors(ctx);
        if (users.length) return callback(ctx, users);

        return ctx.answerCbQuery(ctx.i18n.t("statistics.visitorsNotExistCbMessage"));
    }
}

function tmpFile(ctx, prefix, postfix, callback) {
    tmp.file({ mode: 0644, prefix, postfix }, function _tempFileCreated(err, path, fd, cleanup) {
        try {
            if (err) throw err;
            ctx.answerCbQuery();
            ctx.reply(ctx.i18n.t("statistics.loadStart"));
            return callback(path, fd, cleanup);
        } catch (err) {
            return ctx.reply(ctx.i18n.t("statistics.loadError"));
        }
    });
}

exports.csv = getVisitorsMiddleware((ctx, users) => {
    tmpFile(ctx, "users-", ".csv", (path, fd, cleanup) => {
        csv
            .writeToPath(path, users, { headers: true })
            .on("finish", async(error) => {
                await ctx.replyWithDocument({ source: path });
                cleanup();
            });
    });
})

exports.json = getVisitorsMiddleware((ctx, users) => {
    tmpFile(ctx, "users-", ".json", (path, fd, cleanup) => {
        fs.writeFile(path, JSON.stringify(users), async(err) => {
            await ctx.replyWithDocument({ source: path });
            cleanup();
        });
    });
})

exports.xlsx = getVisitorsMiddleware((ctx, users) => {
    tmpFile(ctx, "users-", ".xlsx", (path, fd, cleanup) => {
        const data = [
            _.keys(users[0]),
            ...users.map((user) => _.values(user))
        ];
        const buffer = xlsx.build([{ name: "visitors", data: data }]);
        fs.writeFile(path, buffer, async(err) => {
            await ctx.replyWithDocument({ source: path });
            cleanup();
        });
    });
})

exports.xml = getVisitorsMiddleware((ctx, users) => {
    const builder = new xml2js.Builder();
    tmpFile(ctx, "users-", ".xml", (path, fd, cleanup) => {
        const obj = {
            users: { user: users }
        };
        const xml = builder.buildObject(obj);
        fs.writeFile(path, xml, async(err) => {
            await ctx.replyWithDocument({ source: path });
            cleanup();
        });
    });
})

exports.info = async(ctx) => {
    const { i18n } = ctx;
    const id = ctx.state.payload;
    ctx.answerCbQuery(i18n.t("statistics.infoCbMessage"));

    const [file, visitors] = await Promise.all([
        FileModel.getFileToUser({ _id: mongoose.Types.ObjectId(id) }),
        VisitorModel.getVisitorsCount(id)
    ]);
    if (!file) return deleteMessage(ctx);
    const keyboard = Markup.inlineKeyboard([
        [Markup.callbackButton(`${i18n.t("statistics.rateButton")}:`, `${file._id}`)],
        [
            Markup.callbackButton(`\u{1F44D} - ${file.likesCount}`, `${file._id}`),
            Markup.callbackButton(`\u{1F44E} - ${file.dislikesCount}`, `${file._id}`),
        ],
        [Markup.callbackButton(`${i18n.t("statistics.visitorsCount")}:`, `${file._id}`)],
        [Markup.callbackButton(`${visitors}`, `${file._id}`)],
        [
            Markup.callbackButton(ctx.i18n.t("file.backButton"), `${STATISTICS_ACTION}:${file._id}`),
            Markup.callbackButton(ctx.i18n.t("file.menuButton"), `${BACK_ACTION}:${file._id}`),
        ],
    ]);

    return ctx.editMessageReplyMarkup(keyboard);
}