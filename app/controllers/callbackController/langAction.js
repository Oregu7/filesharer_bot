module.exports = (ctx) => {
    const langCode = ctx.state.payload;
    ctx.i18n.locale(langCode);
    ctx.deleteMessage();
    return ctx.reply(ctx.i18n.t("lang.saved"));
};