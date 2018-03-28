const Extra = require("telegraf/extra");
const { compileMessage } = require("../helpers");
const { UserModel } = require("../models");

function startCommand(ctx) {
    const startMessage = ctx.i18n.t("start_command");
    const commands = ctx.i18n.t("commands");
    return ctx.reply(`${startMessage}\n\n${commands}`, Extra.HTML());
}

async function otherwise(ctx, data) {
    //let manga = await MangaModel.getManga({ mangaId: Number(data) });
    //if (manga) return sendManga(ctx, manga);

    //ищем файл
    return ctx.reply("O_o");
}

module.exports = async(ctx) => {
    const parts = ctx.message.text.split(" ");
    const route = parts[1] || "/";

    if (!ctx.session.hasOwnProperty("authToken")) {
        let user = await UserModel.createByContext(ctx);
        console.log(`[ new client ] => ${user.username}:${user.userId}`);
        ctx.session.authToken = user._id;
    }

    switch (route) {
        case "/":
            startCommand(ctx);
            break;
        default:
            otherwise(ctx, route);
    }
};