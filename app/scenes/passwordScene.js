const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const md5 = require("md5");
const { leave } = require("telegraf/stage");
const { SETTINGS_ACTION, PASSWORD_ACTION } = require("config").get("constants");
const { FileModel } = require("../models");
const { sendFile, isExistFileMiddleware } = require("../helpers").fileManager;

const passwordScene = new Scene(PASSWORD_ACTION);
const removeKeyboard = Markup.removeKeyboard().extra();

// base actions
passwordScene.enter(isExistFileMiddleware((ctx, file) => {
    // сохраняем файл в state
    ctx.scene.state.file = file;
    if (ctx.update.callback_query) ctx.answerCbQuery(ctx.i18n.t("password.setCbMessage"));
    // формируем стартовое сообщение
    const message = ctx.i18n.t("password.startMessage", { password: file.password });
    const keyboard = getBaseKeyboard(ctx);
    return ctx.reply(message, keyboard.extra());
}));
passwordScene.leave(async(ctx) => {
    const file = getFileFromState(ctx);
    await ctx.reply(ctx.i18n.t("password.cancelMessage"), removeKeyboard);
    return sendFile(ctx, file, SETTINGS_ACTION);
});
// handlers
passwordScene.hears(/^\/cancel$/i, leave());
passwordScene.hears(/(к настройкам|назад|отмена|back|to settings)/i, leave());
passwordScene.hears(/(удалить|delete|remove)/i, async(ctx) => {
    const file = getFileFromState(ctx);
    await FileModel.update({ _id: file._id }, { $set: { password: "" } });
    // выходим из сцены
    ctx.scene.reset();
    ctx.reply(ctx.i18n.t("password.deleteMessage"), removeKeyboard);
    return sendFile(ctx, file, SETTINGS_ACTION);
});
// events
passwordScene.on("text", async(ctx) => {
    const password = md5(ctx.message.text);
    const file = getFileFromState(ctx);
    await FileModel.update({ _id: file._id }, { $set: { password } });
    // выходим из сцены
    ctx.scene.reset();
    await ctx.reply(ctx.i18n.t("password.setMessage"), removeKeyboard);
    return sendFile(ctx, file, SETTINGS_ACTION);
});
passwordScene.on("message", (ctx) => {
    const file = getFileFromState(ctx);
    // формируем стартовое сообщение
    const message = ctx.i18n.t("password.startMessage", { password: file.password });
    const keyboard = getBaseKeyboard(ctx);
    return ctx.reply(message, keyboard.extra());
});
passwordScene.on("callback_query", (ctx) => {
    return ctx.answerCbQuery(ctx.i18n.t("password.setCbMessage"));
});

// helpers
function getFileFromState(ctx) {
    return ctx.scene.state.file;
}

function getBaseKeyboard(ctx) {
    return Markup.keyboard([
        Markup.button(ctx.i18n.t("password.backButton")),
        Markup.button(ctx.i18n.t("password.removeButton")),
    ], { columns: 2 }).resize(true);
}

module.exports = passwordScene;