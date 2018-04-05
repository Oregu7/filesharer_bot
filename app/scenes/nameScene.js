const Scene = require("telegraf/scenes/base");
const escape = require("escape-html");
const Markup = require("telegraf/markup");
const { leave } = require("telegraf/stage");
const { SETTINGS_ACTION, NAME_SCENE } = require("config").get("constants");
const { FileModel } = require("../models");
const { sendFile, isExistFileMiddleware } = require("../helpers").fileManager;
const { isEmail, isURL } = require("validator");

const nameScene = new Scene(NAME_SCENE);
const removeKeyboard = Markup.removeKeyboard().extra();
const maxSize = 70;

// base actions
nameScene.enter(isExistFileMiddleware((ctx, file) => {
    // сохраняем файл в state
    ctx.scene.state.file = file;
    if (ctx.update.callback_query) ctx.answerCbQuery(ctx.i18n.t("name.setCbMessage"));
    // формируем стартовое сообщение
    const message = ctx.i18n.t("name.startMessage", { name: file.name, maxSize });
    const keyboard = getBaseKeyboard(ctx);
    return ctx.replyWithHTML(message, keyboard.extra());
}, true));

nameScene.leave(async(ctx) => {
    const file = getFileFromState(ctx);
    await ctx.reply(ctx.i18n.t("name.cancelMessage"), removeKeyboard);
    return sendFile(ctx, file, SETTINGS_ACTION);
});
// handlers
nameScene.hears(/^\/cancel$/i, leave());
nameScene.hears(/(к настройкам|назад|отмена|back|to settings)/i, leave());
// events
nameScene.on("text", async(ctx) => {
    const { i18n } = ctx;
    const name = escape(ctx.message.text.trim());
    const file = getFileFromState(ctx);
    const keyboard = getBaseKeyboard(ctx);

    if (isURL(name) || isEmail(name))
        return ctx.replyWithHTML(i18n.t("name.wrongMessage"), keyboard.extra());
    else if (name.length > maxSize)
        return ctx.replyWithHTML(i18n.t("name.lengthExceeded", { size: name.length, maxSize }), keyboard.extra());

    // update
    await FileModel.update({ _id: file._id }, { $set: { name } });
    file.name = name;
    // выходим из сцены
    ctx.scene.reset();
    await ctx.reply(i18n.t("name.setMessage"), removeKeyboard);
    return sendFile(ctx, file, SETTINGS_ACTION);
});

nameScene.on("message", (ctx) => {
    const file = getFileFromState(ctx);
    // формируем стартовое сообщение
    const message = ctx.i18n.t("name.startMessage", { name: file.name, maxSize });
    const keyboard = getBaseKeyboard(ctx);
    return ctx.replyWithHTML(message, keyboard.extra());
});

nameScene.on("callback_query", (ctx) => {
    return ctx.answerCbQuery(ctx.i18n.t("name.setCbMessage"));
});

// helpers
function getFileFromState(ctx) {
    return ctx.scene.state.file;
}

function getBaseKeyboard(ctx) {
    return Markup.keyboard([
        Markup.button(ctx.i18n.t("name.backButton")),
    ]).resize(true);
}

module.exports = nameScene;