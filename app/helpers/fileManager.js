const _ = require("lodash");
const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");
const randomize = require("randomatic");
const { FileModel, VisitorModel } = require("../models");
const {
    SETTINGS_ACTION,
    STATISTICS_ACTION,
    STATISTICS_CSV_ACTION,
    STATISTICS_JSON_ACTION,
    STATISTICS_XML_ACTION,
    STATISTICS_XLSX_ACTION,
    STATISTICS_INFO_ACTION,
    REMOVE_ACTION,
    DELETE_ACTION,
    PASSWORD_ACTION,
    RATE_ACTION,
    LIKE_ACTION,
    SAVE_ACTION,
    NAME_ACTION,
    DISLIKE_ACTION,
    BACK_ACTION,
} = require("config").get("constants");

// работа с файлом
function createFile(ctx, type) {
    const fileData = ctx.message[type];
    const [{
        file_id: fileId,
        file_name: fileName = `${type.toUpperCase()} ${randomize("0", 5)}`,
    }] = _.isArray(fileData) ? fileData.slice(-1) : [fileData];
    const author = ctx.session.authToken;

    return FileModel.create({
        fileId,
        type,
        author,
        name: fileName.slice(0, 70),
    });
}

function copyFile(ctx, file) {
    const { fileId, type, name } = file;
    const author = ctx.session.authToken;

    return FileModel.create({
        fileId,
        type,
        author,
        name,
    });
}

function deleteFile(id) {
    return Promise.all([
        VisitorModel.remove({ fileId: id }),
        FileModel.remove({ _id: id }),
    ]);
}

function getFileById(id) {
    return FileModel.findById(id);
}

function deleteMessage(ctx) {
    ctx.answerCbQuery(ctx.i18n.t("file.deletedCbMessage"), true);
    return ctx.deleteMessage();
}

function isExistFileMiddleware(callback, select = "password fileId type publicId options name") {
    return async(ctx) => {
        const id = ctx.state.payload;
        const file = await getFileById(id).select(select);
        if (!file) return deleteMessage(ctx);

        return callback(ctx, file);
    };
}

// формирование клавиатур
function createMainKeyboard(ctx, fileId) {
    return Markup.inlineKeyboard([
        [Markup.callbackButton(ctx.i18n.t("file.settingsButton"), `${SETTINGS_ACTION}:${fileId}`)],
        [Markup.callbackButton(ctx.i18n.t("file.statisticsButton"), `${STATISTICS_ACTION}:${fileId}`)],
        [
            Markup.switchToChatButton(ctx.i18n.t("file.replyButton"), `file:${fileId}`),
            Markup.callbackButton(ctx.i18n.t("file.removeButton"), `${REMOVE_ACTION}:${fileId}`),
        ],
    ]);
}

function createRemoveKeyboard(ctx, fileId) {
    return Markup.inlineKeyboard([
        Markup.callbackButton(ctx.i18n.t("file.backButton"), `${BACK_ACTION}:${fileId}`),
        Markup.callbackButton(ctx.i18n.t("file.deleteButton"), `${DELETE_ACTION}:${fileId}`),
    ], { columns: 2 });
}

function createSettingsKeyboard(ctx, fileId) {
    return Markup.inlineKeyboard([
        [Markup.callbackButton(ctx.i18n.t("file.nameButton"), `${NAME_ACTION}:${fileId}`)],
        [
            Markup.callbackButton(ctx.i18n.t("file.passwordButton"), `${PASSWORD_ACTION}:${fileId}`),
            Markup.callbackButton(ctx.i18n.t("file.rateButton"), `${RATE_ACTION}:${fileId}`)
        ],
        [Markup.callbackButton(ctx.i18n.t("file.backButton"), `${BACK_ACTION}:${fileId}`)],
    ]);
}

function createStaticsKeyboard(ctx, fileId) {
    return Markup.inlineKeyboard([
        [Markup.callbackButton(ctx.i18n.t("file.statisticsInfoButton"), `${STATISTICS_INFO_ACTION}:${fileId}`)],
        [
            Markup.callbackButton(".csv", `${STATISTICS_CSV_ACTION}:${fileId}`),
            Markup.callbackButton(".xls", `${STATISTICS_XLSX_ACTION}:${fileId}`),
            Markup.callbackButton(".xml", `${STATISTICS_XML_ACTION}:${fileId}`),
            Markup.callbackButton(".json", `${STATISTICS_JSON_ACTION}:${fileId}`),
        ],
        [Markup.callbackButton(ctx.i18n.t("file.backButton"), `${BACK_ACTION}:${fileId}`)],
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

function createUserKeyboard(ctx, file) {
    const keyboard = [
        [Markup.callbackButton(ctx.i18n.t("save.button"), `${SAVE_ACTION}:${file._id}`)],
        [Markup.switchToChatButton(ctx.i18n.t("file.replyButton"), `file:${file._id}`)],
    ];
    const rateKeyboard = [
        Markup.callbackButton(`\u{1F44D}${file.likesCount}`, `${LIKE_ACTION}:${file._id}`),
        Markup.callbackButton(`\u{1F44E}${file.dislikesCount}`, `${DISLIKE_ACTION}:${file._id}`),
    ];
    if (file.options.rate) keyboard.unshift(rateKeyboard);
    return Markup.inlineKeyboard(keyboard);
}

// Формирование сообщений
function sendFileBase(ctx, file, keyboard) {
    const { type, fileId, publicId, name } = file;
    const caption = ctx.i18n.t("file.caption", { publicId, name });
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

function sendFile(ctx, file, keyboardType = "main") {
    const keyboard = createKeyboard(ctx, file._id, keyboardType);
    return sendFileBase(ctx, file, keyboard);
}

function sendFileToUser(ctx, file) {
    // register user
    VisitorModel.registerVistor(ctx, file);
    const keyboard = createUserKeyboard(ctx, file);
    return sendFileBase(ctx, file, keyboard);
}

module.exports = {
    createFile,
    copyFile,
    deleteFile,
    getFileById,
    deleteMessage,
    isExistFileMiddleware,
    createKeyboard,
    createMainKeyboard,
    createSettingsKeyboard,
    createRemoveKeyboard,
    createUserKeyboard,
    sendFile,
    sendFileToUser,
    sendFileBase,
};