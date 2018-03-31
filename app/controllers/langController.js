const Markup = require("telegraf/markup");
const { LANG_ACTION } = require("config").get("constants");

module.exports = (ctx) => {
    const message = ctx.i18n.t("base.langCommand");
    const keyboard = Markup.inlineKeyboard([
        Markup.callbackButton("\u{1F1F7}Русский", `${LANG_ACTION}:ru`),
        Markup.callbackButton("\u{1F1EC}English", `${LANG_ACTION}:en`),
    ], { columns: 2 });

    return ctx.reply(message, keyboard.extra());
};