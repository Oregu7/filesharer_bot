const Extra = require("telegraf/extra");

module.exports = (ctx) =>
    ctx.reply(ctx.i18n.t("base.rateCommand", { bot_name: "filesharer_bot" }), Extra.HTML());