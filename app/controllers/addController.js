const Extra = require("telegraf/extra");

module.exports = (ctx) => {
    const message = ctx.i18n.t("base.addCommand");
    const dataFormats = ctx.i18n.t("base.dataFormats");
    return ctx.reply(`${message}${dataFormats}`, Extra.HTML());
};