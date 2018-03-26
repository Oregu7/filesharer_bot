const Extra = require("telegraf/extra");
const compileMessage = require("../helpers/compileMessage");
const UserModel = require("../models/user");

async function startCommand(ctx) {
    const message = `<b>FileSharer Bot - </b> это бот, который позволит вам делиться
    файлами с другими пользователями.
    
    Используйте эти команды, чтобы управлять ботом:
    
    <b>Основные</b>
    /add - добавить файл
    /files - мои файлы
    
    <b>Помощь</b>
    /help - справка
    /feedback - связаться с нами
    
    /rate - оценить бот`;

    return ctx.reply(compileMessage(message), Extra.HTML());
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