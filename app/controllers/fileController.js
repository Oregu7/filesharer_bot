const Markup = require("telegraf/markup");
const { FileModel } = require("../models");
const { sendFile } = require("../helpers").fileManager;

exports.getFile = async(ctx) => {
    const [, publicId] = ctx.match;
    const { id: userId } = ctx.message.from;
    const file = await FileModel.findOne({ publicId })
        .select("type fileId publicId name created_at author")
        .populate({
            path: "author",
            select: "userId",
        });

    if (file && file.author.userId === userId) return sendFile(ctx, file);
    else return ctx.reply(ctx.i18n.t("base.getFileCommand"));
};

exports.files = (ctx) => {
    const { i18n } = ctx;
    const message = i18n.t("base.filesCommand");
    const keyboard = Markup.inlineKeyboard([
        [Markup.switchToCurrentChatButton(i18n.t("files.all"), "all:")],
        [
            Markup.switchToCurrentChatButton(i18n.t("files.photo"), "photo:"),
            Markup.switchToCurrentChatButton(i18n.t("files.document"), "document:"),
            Markup.switchToCurrentChatButton(i18n.t("files.audio"), "audio:"),
        ],
        [
            Markup.switchToCurrentChatButton(i18n.t("files.video"), "video:"),
            Markup.switchToCurrentChatButton(i18n.t("files.voice"), "voice:"),
        ],
    ]);

    return ctx.reply(message, keyboard.extra());
};