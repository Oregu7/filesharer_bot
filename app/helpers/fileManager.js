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
    OPTIONS_ACTION,
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
    return FileModel.findById(id)
        .populate("author")
        .select("-likes -dislikes");
}

function deleteMessage(ctx) {
    ctx.answerCbQuery(ctx.i18n.t("file.deletedCbMessage"), true);
    return ctx.deleteMessage();
}

function isExistFileMiddleware(callback, scene = false) {
    return async(ctx) => {
        const id = ctx.state.payload;
        const file = await getFileById(id);
        if (!file) {
            if (scene) ctx.scene.reset();
            return deleteMessage(ctx);
        }

        return callback(ctx, file);
    };
}

// формирование клавиатур
function createMainKeyboard(ctx, fileId) {
    const { i18n } = ctx;
    return Markup.inlineKeyboard([
        Markup.callbackButton(i18n.t("file.settingsButton"), `${SETTINGS_ACTION}:${fileId}`),
        Markup.callbackButton(i18n.t("file.statisticsButton"), `${STATISTICS_ACTION}:${fileId}`),
        Markup.switchToChatButton(i18n.t("file.replyButton"), `file:${fileId}`),
    ], { columns: 2 });
}

function createRemoveKeyboard(ctx, fileId) {
    const { i18n } = ctx;
    return Markup.inlineKeyboard([
        Markup.callbackButton(i18n.t("file.backButton"), `${SETTINGS_ACTION}:${fileId}`),
        Markup.callbackButton(i18n.t("file.deleteButton"), `${DELETE_ACTION}:${fileId}`),
    ], { columns: 2 });
}

function createSettingsKeyboard(ctx, fileId) {
    const { i18n } = ctx;
    return Markup.inlineKeyboard([
        [
            Markup.callbackButton(i18n.t("file.passwordButton"), `${PASSWORD_ACTION}:${fileId}`),
            Markup.callbackButton(i18n.t("file.nameButton"), `${NAME_ACTION}:${fileId}`),
        ],
        [Markup.callbackButton(i18n.t("file.optionalButton"), `${OPTIONS_ACTION}:${fileId}`)],
        [Markup.callbackButton(i18n.t("file.removeButton"), `${REMOVE_ACTION}:${fileId}`)],
        [Markup.callbackButton(i18n.t("file.menuButton"), `${BACK_ACTION}:${fileId}`)],
    ]);
}

function createStaticsKeyboard(ctx, fileId) {
    const { i18n } = ctx;
    return Markup.inlineKeyboard([
        [Markup.callbackButton(i18n.t("file.statisticsInfoButton"), `${STATISTICS_INFO_ACTION}:${fileId}`)],
        [
            Markup.callbackButton(".csv", `${STATISTICS_CSV_ACTION}:${fileId}`),
            Markup.callbackButton(".xls", `${STATISTICS_XLSX_ACTION}:${fileId}`),
            Markup.callbackButton(".xml", `${STATISTICS_XML_ACTION}:${fileId}`),
            Markup.callbackButton(".json", `${STATISTICS_JSON_ACTION}:${fileId}`),
        ],
        [Markup.callbackButton(i18n.t("file.menuButton"), `${BACK_ACTION}:${fileId}`)],
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
    const { i18n } = ctx;
    const keyboard = [
        [Markup.callbackButton(i18n.t("save.button"), `${SAVE_ACTION}:${file._id}`)],
        [Markup.switchToChatButton(i18n.t("file.replyButton"), `file:${file._id}`)],
    ];
    const rateKeyboard = [
        Markup.callbackButton(`\u{1F44D}${file.likesCount}`, `${LIKE_ACTION}:${file._id}`),
        Markup.callbackButton(`\u{1F44E}${file.dislikesCount}`, `${DISLIKE_ACTION}:${file._id}`),
    ];
    // добавляем опциональные кнопки
    if (file.options.rate) keyboard.unshift(rateKeyboard);
    return Markup.inlineKeyboard(keyboard);
}

// Формирование сообщений
function sendFileBase(ctx, file, keyboard) {
    if (!file) return ctx.reply(ctx.i18n.t("file.notExist"));
    const { type, fileId } = file;
    const caption = createCaption(ctx, file);
    const extra = Extra.HTML()
        .load({ caption })
        .markup(keyboard);

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

function createCaption(ctx, file) {
    const { i18n } = ctx;
    const { userId, firstName, lastName } = file.author;
    const { link, name, author } = file.options;
    const fileName = `<b>${file.name}</b>`;
    const fileLink = i18n.t("file.caption.link", { publicId: file.publicId });
    const fileAuthor = i18n.t("file.caption.author", { userId, firstName, lastName });
    let caption = `${name ? fileName : ""}${author && name ? "\n": ""}${author ? fileAuthor : ""}${(author || name) && link ? "\n\n" : ""}${link ? fileLink : ""}`;

    return caption.slice(0, 200);
}

function sendFile(ctx, file, keyboardType = "main") {
    if (!file) return ctx.reply(ctx.i18n.t("file.notExist"));
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
    createCaption,
    sendFile,
    sendFileToUser,
    sendFileBase,
};