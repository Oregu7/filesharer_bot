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

function getVisitorsMiddleware(callback) {
    return async(ctx) => {
        const users = await VisitorModel.getVisitors(ctx);
        if (users.length) return callback(ctx, users);

        return ctx.answerCbQuery("Никто не просматривал данный файл!");
    }
}

function tmpFile(ctx, prefix, postfix, callback) {
    tmp.file({ mode: 0644, prefix, postfix }, function _tempFileCreated(err, path, fd, cleanup) {
        try {
            if (err) throw err;
            ctx.answerCbQuery();
            ctx.reply("Начинаю загрузку файла...");
            return callback(path, fd, cleanup);
        } catch (err) {
            return ctx.reply("Что-то пошло не так :(");
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
        const buffer = xlsx.build([{ name: "mySheetName", data: data }]);
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
    ctx.answerCbQuery("Формирую статистику \u{1F4C8}", true);
    const id = ctx.state.payload;
    const [file, visitors] = await Promise.all([
        FileModel.getFileToUser({ _id: mongoose.Types.ObjectId(id) }),
        VisitorModel.getVisitorsCount(id)
    ]);

    const keyboard = Markup.inlineKeyboard([
        [Markup.callbackButton("\u{2B50} Рейтинг:", `${file._id}`)],
        [
            Markup.callbackButton(`\u{1F44D} - ${file.likesCount}`, `${file._id}`),
            Markup.callbackButton(`\u{1F44E} - ${file.dislikesCount}`, `${file._id}`),
        ],
        [Markup.callbackButton("\u{1F465} Количество просмотров:", `${file._id}`)],
        [Markup.callbackButton(`${visitors}`, `${file._id}`)],
        [
            Markup.callbackButton(ctx.i18n.t("file.backButton"), `${STATISTICS_ACTION}:${file._id}`),
            Markup.callbackButton(ctx.i18n.t("file.menuButton"), `${BACK_ACTION}:${file._id}`),
        ],
    ]);

    return ctx.editMessageReplyMarkup(keyboard);
}