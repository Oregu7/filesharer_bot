const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const md5 = require("md5");
const { leave } = require("telegraf/stage");
const { SEND_FILE_TO_USER_SCENE } = require("config").get("constants");
const { FileModel } = require("../models");
const { sendFileToUser } = require("../helpers").fileManager;

const sendFileToUserScene = new Scene(SEND_FILE_TO_USER_SCENE);
const removeKeyboard = Markup.removeKeyboard().extra();

// base actions
sendFileToUserScene.enter(async(ctx) => {
    const publicId = ctx.state.payload;
    const file = await FileModel.getFileToUser({ publicId });
    if (!file) {
        // выходим из сцены
        ctx.scene.reset();
        return ctx.reply("Я не нашел файл с данным идентификатором ヽ(・_・ )ノ");
    } else if (!file.password) {
        // выходим из сцены
        ctx.scene.reset();
        return sendFileToUser(ctx, file);
    } else {
        ctx.scene.state.file = file;
        const keyboard = getBaseKeyboard(ctx);
        return ctx.reply("Для получения доступа к файлу, пожалуйста введите пароль:", keyboard);
    }
});
sendFileToUserScene.leave((ctx) => {
    return ctx.reply("Ну что ж, значит не в этот раз ヽ(ー_ー )ノ");
});
// handlers
sendFileToUserScene.hears(/(назад|отмена)/i, leave());
// events
sendFileToUserScene.on("text", async(ctx) => {
    const password = md5(ctx.message.text);
    const file = getFileFromState(ctx);
    if (file.password !== password) return ctx.reply("Вы ввели неверный пароль (￢_￢)");
    // выходим из сцены
    ctx.scene.reset();
    await ctx.reply("Доступ к файлу открыт.", removeKeyboard);
    return sendFileToUser(ctx, file);
});

sendFileToUserScene.on("callback_query", (ctx) => {
    return ctx.answerCbQuery(ctx.i18n.t("password.setCbMessage"));
});

// helpers
function getFileFromState(ctx) {
    return ctx.scene.state.file;
}

function getBaseKeyboard(ctx) {
    return Markup.keyboard([
        Markup.button("\u{2716}Отмена"),
    ]).resize(true).extra();
}

module.exports = sendFileToUserScene;