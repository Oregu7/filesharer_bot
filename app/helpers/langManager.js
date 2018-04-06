const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");
const { LANG_ACTION } = require("config").get("constants");
const { start } = require("./commands");

exports.sendLanguagesList = (ctx) => {
    const message = ctx.i18n.t("base.langCommand");
    const keyboard = Markup.inlineKeyboard([
        Markup.callbackButton("Русский", `${LANG_ACTION}:ru`),
        Markup.callbackButton("English", `${LANG_ACTION}:en`),
    ], { columns: 2 });

    return ctx.reply(message, keyboard.extra());
};

exports.setLanguage = (ctx, langCode) => {
    const { i18n } = ctx;
    i18n.locale(langCode);
    ctx.answerCbQuery(i18n.t("lang.saved"));
    return ctx.editMessageText(start(ctx), Extra.HTML());
};