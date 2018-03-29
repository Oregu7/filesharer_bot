const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const md5 = require("md5");
const { leave } = require("telegraf/stage");
const { SETTINGS_ACTION, PASSWORD_ACTION } = require("config").get("constants");
const { FileModel } = require("../models");
const { sendFile } = require("../helpers").fileManager;

const passwordScene = new Scene(PASSWORD_ACTION);
const removeKeyboard = Markup.removeKeyboard().extra();

// base actions
passwordScene.enter(async(ctx) => {
    const id = ctx.state.payload;
    const file = await FileModel.findById(id).select("password fileId type publicId");
    ctx.scene.state.file = file;
    if (ctx.update.callback_query) ctx.answerCbQuery("\u{1F510}Установить пароль");

    const message = ctx.i18n.t("password_start", { password: file.password });
    const keyboard = Markup.keyboard([
        Markup.button("\u{1F519}назад"),
        Markup.button("\u{2702}удалить"),
    ], { columns: 2 }).resize(true);

    return ctx.reply(message, keyboard.extra());
});
passwordScene.leave(async(ctx) => {
    await ctx.reply("Ну что ж, значит не в этот раз ヽ(ー_ー )ノ", removeKeyboard);
    return sendFile(ctx, ctx.scene.state.file, SETTINGS_ACTION);
});
// handlers
passwordScene.hears(/(назад|отмена)/i, leave());
passwordScene.hears(/удалить/i, async(ctx) => {
    const file = ctx.scene.state.file;
    await FileModel.update({ _id: file._id }, { $set: { password: "" } });
    // выходим из сцены
    ctx.scene.reset();
    ctx.reply("Текущий пароль успешно удален!", removeKeyboard);
    return sendFile(ctx, file, SETTINGS_ACTION);
});
// events
passwordScene.on("text", async(ctx) => {
    const password = md5(ctx.message.text);
    const file = ctx.scene.state.file;
    await FileModel.update({ _id: file._id }, { $set: { password } });
    // выходим из сцены
    ctx.scene.reset();
    await ctx.reply("Новый пароль успешно установлен !", removeKeyboard);
    return sendFile(ctx, file, SETTINGS_ACTION);
});

passwordScene.on("callback_query", (ctx) => {
    return ctx.answerCbQuery("\u{1F510}Установить пароль");
});

module.exports = passwordScene;