const { isExistFileMiddleware, sendFile, copyFile } = require("../../helpers").fileManager;

module.exports = isExistFileMiddleware(async(ctx, file) => {
    ctx.answerCbQuery();
    ctx.reply(ctx.i18n.t("save.message"));
    const copy = await copyFile(ctx, file);
    return sendFile(ctx, copy);
});