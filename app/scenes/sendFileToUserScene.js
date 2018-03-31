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
    const { i18n } = ctx;
    const publicId = ctx.scene.state.publicId;
    const file = await FileModel.getFileToUser({ publicId });
    if (!file) {
        // выходим из сцены
        ctx.scene.reset();
        return ctx.reply(i18n.t("sendFile.notExist"));
    } else if (!file.password) {
        // выходим из сцены
        ctx.scene.reset();
        return sendFileToUser(ctx, file);
    } else {
        ctx.scene.state.file = file;
        const keyboard = getBaseKeyboard(ctx);
        return ctx.reply(`${i18n.t("sendFile.needPassword")}:`, keyboard);
    }
});
sendFileToUserScene.leave((ctx) => {
    return ctx.reply(ctx.i18n.t("sendFile.cancel"), removeKeyboard);
});
// handlers
sendFileToUserScene.hears(/(назад|отмена|cancel|back)/i, leave());
// events
sendFileToUserScene.on("text", async(ctx) => {
    const { i18n } = ctx;
    const password = md5(ctx.message.text);
    const file = getFileFromState(ctx);
    if (file.password !== password) return ctx.reply(i18n.t("sendFile.incorrectPassword"));
    // выходим из сцены
    ctx.scene.reset();
    await ctx.reply(i18n.t("sendFile.accessOpening"), removeKeyboard);
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
        Markup.button(ctx.i18n.t("sendFile.cancelButton")),
    ]).resize(true).extra();
}

module.exports = sendFileToUserScene;