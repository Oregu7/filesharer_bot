const Markup = require("telegraf/markup");

module.exports = (ctx) => {
    const { i18n } = ctx;
    const message = i18n.t("base.filesCommand");
    const keyboard = Markup.inlineKeyboard([
        [Markup.switchToCurrentChatButton(i18n.t("files.all"), "all:")],
        [
            Markup.switchToCurrentChatButton(i18n.t("files.photo"), "photo:"),
            Markup.switchToCurrentChatButton(i18n.t("files.document"), "document:"),
        ],
        [
            Markup.switchToCurrentChatButton(i18n.t("files.audio"), "audio:"),
            Markup.switchToCurrentChatButton(i18n.t("files.video"), "video:"),
        ],
        [Markup.switchToCurrentChatButton(i18n.t("files.voice"), "voice:")],
    ]);

    return ctx.reply(message, keyboard.extra());
};