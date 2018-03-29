const _ = require("lodash");
const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");
const randomize = require("randomatic");
const { FileModel } = require("../models");
const { getUserInfo } = require("../util");
const {
    SETTINGS_ACTION,
    STATISTICS_ACTION,
    STATISTICS_FILE_ACTION,
    REMOVE_ACTION,
    DELETE_ACTION,
    PASSWORD_ACTION,
    RATE_ACTION,
    BACK_ACTION,
} = require("config").get("constants");

function createFile(ctx, type) {
    const fileData = ctx.message[type];
    const [{
        file_id: fileId,
        file_name: fileName = `${type.toUpperCase()} ${randomize("0", 5)}`,
    }] = _.isArray(fileData) ? fileData.slice(-1) : [fileData];

    const author = getUserInfo(ctx);
    return FileModel.create({
        fileId,
        type,
        author,
        name: fileName,
    });
}

function deleteFile(id) {
    return FileModel.remove({ _id: id });
}

function getFileById(id) {
    return FileModel.findById(id);
}

function isExistFileMiddleware(callback, select = "password fileId type publicId options") {
    return async(ctx) => {
        const id = ctx.state.payload;
        const file = await getFileById(id).select(select);
        if (!file) {
            ctx.answerCbQuery("Похоже файл уже удален :(", true);
            return ctx.deleteMessage();
        }

        return callback(ctx, file);
    };
}

function createMainKeyboard(ctx, fileId) {
    return Markup.inlineKeyboard([
        Markup.callbackButton("\u{2699}Настройки", `${SETTINGS_ACTION}:${fileId}`),
        Markup.callbackButton("\u{1F4CA}Статистика", `${STATISTICS_ACTION}:${fileId}`),
        Markup.switchToChatButton("\u{1F4E2}Поделиться", `file:${fileId}`),
        Markup.callbackButton("\u{274C}Удалить", `${REMOVE_ACTION}:${fileId}`),
    ], { columns: 2 });
}

function createRemoveKeyboard(ctx, fileId) {
    return Markup.inlineKeyboard([
        Markup.callbackButton("\u{1F519}Отмена", `${BACK_ACTION}:${fileId}`),
        Markup.callbackButton("\u{1F5D1}Удалить", `${DELETE_ACTION}:${fileId}`),
    ], { columns: 2 });
}

function createSettingsKeyboard(ctx, fileId) {
    return Markup.inlineKeyboard([
        Markup.callbackButton("\u{1F510}Пароль", `${PASSWORD_ACTION}:${fileId}`),
        Markup.callbackButton("\u{2B50}Рейтинг", `${RATE_ACTION}:${fileId}`),
        Markup.callbackButton("\u{1F519}Назад", `${BACK_ACTION}:${fileId}`),
    ], { columns: 2 });
}

function createStaticsKeyboard(ctx, fileId) {
    return Markup.inlineKeyboard([
        [Markup.callbackButton("\u{1F4C8}Показатели", `${STATISTICS_FILE_ACTION}:${fileId}`)],
        [
            Markup.callbackButton(".csv", `${STATISTICS_FILE_ACTION}:${fileId}`),
            Markup.callbackButton(".xls", `${STATISTICS_FILE_ACTION}:${fileId}`),
            Markup.callbackButton(".xml", `${STATISTICS_FILE_ACTION}:${fileId}`),
            Markup.callbackButton(".json", `${STATISTICS_FILE_ACTION}:${fileId}`),
        ],
        [Markup.callbackButton("\u{1F519}Назад", `${BACK_ACTION}:${fileId}`)],
    ]);
}

function createKeyboard(ctx, fileId, type = "main") {
    switch (type) {
        case "main":
            return createMainKeyboard(ctx, fileId);
        case REMOVE_ACTION:
            return createRemoveKeyboard(ctx, fileId);
        case SETTINGS_ACTION:
            return createSettingsKeyboard(ctx, fileId);
        case STATISTICS_ACTION:
            return createStaticsKeyboard(ctx, fileId);
    }
}

function createMessage(ctx, file) {
    const { name, description, type, publicId } = file;
    return ctx.i18n.t("file_info", {
        name,
        publicId,
        description: description || "...",
        type,
    });
}

function sendFile(ctx, file, keyboardType = "main") {
    const { type, fileId, publicId } = file;
    const keyboard = createKeyboard(ctx, file._id, keyboardType);
    const link = `https://t.me/filesharer_bot?start=${publicId}`;
    const caption = `ссылка: ${link}`;
    const extra = Extra.load({ caption }).markup(keyboard);

    switch (type) {
        case "photo":
            return ctx.replyWithPhoto(fileId, extra);
        case "audio":
            return ctx.replyWithAudio(fileId, extra);
        case "document":
            return ctx.replyWithDocument(fileId, extra);
        case "voice":
            return ctx.replyWithVoice(fileId, extra);
        case "video":
            return ctx.replyWithVideo(fileId, extra);
    }
}

module.exports = {
    createFile,
    deleteFile,
    getFileById,
    isExistFileMiddleware,
    createKeyboard,
    createMainKeyboard,
    createSettingsKeyboard,
    createRemoveKeyboard,
    createMessage,
    sendFile,
};