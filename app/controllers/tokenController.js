const Extra = require("telegraf/extra");
const { uid } = require("rand-token");

const startController = require("./startController");
const { TokenModel } = require("../models");
const { getUserId } = require("../utils");
const { isAdminMiddleware } = require("../middlewares");

async function generateToken(ctx) {
    const source = uid(33);
    const authorId = getUserId(ctx);
    const token = await TokenModel.create({ source, authorId });
    const message = ctx.i18n.t("token.generate", { source: token.source });
    return ctx.replyWithHTML(message, Extra.HTML());
}

async function authorizeByToken(ctx) {
    const { i18n } = ctx;
    const source = ctx.message.text;
    const token = await TokenModel.findOne({ source });
    const userId = getUserId(ctx);
    let message = i18n.t("token.notExist");
    if (token && !token.used) {
        ctx.session.allowed = true;
        token.used = true;
        token.userId = userId;
        token.updated_at = Date.now();
        await token.save();
        return startController(ctx);
    } else if (token && token.used) {
        message = i18n.t("token.alreadyUsed");
    }
    return ctx.reply(message);
}

module.exports = {
    generateToken: isAdminMiddleware(generateToken),
    authorizeByToken,
};