const { createFile, sendFile } = require("../helpers").fileManager;

module.exports = (type) => async(ctx) => {
    await ctx.reply(ctx.i18n.t("base.addFileCommand"));
    const file = await createFile(ctx, type);
    return sendFile(ctx, file);
};