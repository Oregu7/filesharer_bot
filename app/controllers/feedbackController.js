module.exports = (ctx) =>
    ctx.reply(ctx.i18n.t("base.feedbackCommand", { bot_name: "@filesharer_bot" }));