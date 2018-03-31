const Extra = require("telegraf/extra");
const { SEND_FILE_TO_USER_SCENE } = require("config").get("constants");
const { UserModel } = require("../models");

function startCommand(ctx) {
    const startMessage = ctx.i18n.t("base.startCommand");
    const commands = ctx.i18n.t("base.commandsList");
    return ctx.reply(`${startMessage}\n\n${commands}`, Extra.HTML());
}

async function otherwise(ctx, publicId) {
    ctx.state.payload = publicId;
    return ctx.scene.enter(SEND_FILE_TO_USER_SCENE);
}

module.exports = async(ctx) => {
    const parts = ctx.message.text.split(" ");
    const route = parts[1] || "/";

    if (!ctx.session.hasOwnProperty("authToken")) {
        let user = await UserModel.createByContext(ctx);
        console.log(`[ new client ] => ${user.username}:${user.userId}`);
        ctx.session.authToken = user._id;
    }

    if (route == "/") return startCommand(ctx);

    return otherwise(ctx, route);
};