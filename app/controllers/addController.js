const Extra = require("telegraf/extra");

module.exports = (ctx) => {
    const message = ctx.i18n.t("add_command");
    const dataFormats = ctx.i18n.t("data_formats");
    return ctx.reply(`${message}${dataFormats}`, Extra.HTML());
};