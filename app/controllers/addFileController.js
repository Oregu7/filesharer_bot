const { Mutex } = require("../util");
const { createFile, sendFile } = require("../helpers").fileManager;

module.exports = (type) => new Mutex(async(ctx, done) => {
    try {
        let ok = await ctx.reply(ctx.i18n.t("base.addFileCommand"));
        const file = await createFile(ctx, type);
        let fileOk = await sendFile(ctx, file);
    } catch (err) {
        ctx.reply(ctx.i18n.t("base.fileLoadError"));
    }
    return done();
}).start();