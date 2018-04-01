const Extra = require("telegraf/extra");

module.exports = (ctx) => {
    const { i18n } = ctx;
    const helpMessage = i18n.t("base.helpCommand", {
        help_url: "http://telegra.ph/Spravka-Mangakun-Bot-03-23",
        bot_name: "@filesharer_bot",
    });
    const commands = i18n.t("base.commandsList");
    return ctx.reply(`${helpMessage}\n\n${commands}`, Extra.HTML());
};