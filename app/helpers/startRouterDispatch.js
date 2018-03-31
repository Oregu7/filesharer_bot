const Extra = require("telegraf/extra");
const filesController = require("../controllers/filesController");
const { SEND_FILE_TO_USER_SCENE } = require("config").get("constants");

function startCommand(ctx) {
    const startMessage = ctx.i18n.t("base.startCommand");
    const commands = ctx.i18n.t("base.commandsList");
    return ctx.reply(`${startMessage}\n\n${commands}`, Extra.HTML());
}

function fileNotExistHandler(ctx) {
    return ctx.reply(ctx.i18n.t("file.notExist"));
}

async function otherwise(ctx, publicId) {
    return ctx.scene.enter(SEND_FILE_TO_USER_SCENE, { publicId });
}

module.exports = (ctx, route = "/") => {
    switch (route) {
        case "/":
            return startCommand(ctx);
        case "files":
            return filesController(ctx);
        case "file_not_exist":
            return fileNotExistHandler(ctx);
        default:
            return otherwise(ctx, route);
    }
};