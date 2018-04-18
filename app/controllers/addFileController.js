const { createFile, sendFile } = require("../helpers").fileManager;

module.exports = (type) => async(ctx) => {
    try {
        const file = await createFile(ctx, type);
        let ok = await sendFile(ctx, file);
    } catch (err) {
        ctx.reply(ctx.i18n.t("base.fileLoadError"));
    }
};