const Extra = require("telegraf/extra");
const { SEND_FILE_TO_USER_SCENE } = require("config").get("constants");
const filesController = require("../controllers/filesController");
const { start } = require("./commands");

function fileNotExistHandler(ctx) {
    return ctx.reply(ctx.i18n.t("file.notExist"));
}

function startCommand(ctx) {
    const message = start(ctx);
    return ctx.reply(message, Extra.HTML());
}

async function otherwise(ctx, publicId) {
    return ctx.scene.enter(SEND_FILE_TO_USER_SCENE, { publicId });
}

module.exports = (ctx, route = "/", start = true) => {
    switch (route) {
        case "/":
            if (start) return startCommand(ctx);
            break;
        case "files":
            return filesController(ctx);
        case "file_not_exist":
            return fileNotExistHandler(ctx);
        default:
            return otherwise(ctx, route);
    }
};