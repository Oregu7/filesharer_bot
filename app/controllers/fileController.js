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
    else return ctx.reply("\u{26A0}Данный файл не найден!");
};

exports.files = (ctx) => {
    const message = "Выберете тип файлов:";
    const keyboard = Markup.inlineKeyboard([
        [Markup.switchToCurrentChatButton("\u{1F300}все", "all:")],
        [
            Markup.switchToCurrentChatButton("\u{1F5BC}изображения", "photo:"),
            Markup.switchToCurrentChatButton("\u{1F4E6}документы", "document:"),
            Markup.switchToCurrentChatButton("\u{1F3B5}аудио-файлы", "audio:"),
        ],
        [
            Markup.switchToCurrentChatButton("\u{1F4F9}видеозаписи", "video:"),
            Markup.switchToCurrentChatButton("\u{1F3A4}голосовые сообщения", "voice:"),
        ],
    ]);

    return ctx.reply(message, keyboard.extra());
};