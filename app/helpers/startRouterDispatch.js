const Extra = require("telegraf/extra");
const { SEND_FILE_TO_USER_SCENE } = require("config").get("constants");

function startCommand(ctx) {
    const startMessage = ctx.i18n.t("base.startCommand");
    const commands = ctx.i18n.t("base.commandsList");
    return ctx.reply(`${startMessage}\n\n${commands}`, Extra.HTML());
}

async function otherwise(ctx, publicId) {
    return ctx.scene.enter(SEND_FILE_TO_USER_SCENE, { publicId });
}

module.exports = (ctx, route = "/") => {
    if (route == "/") return startCommand(ctx);
    return otherwise(ctx, route);
};