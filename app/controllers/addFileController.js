const { Mutex } = require("../util");
const { createFile, sendFile } = require("../helpers").fileManager;

module.exports = (type) => new Mutex(async(ctx, done) => {
    try {
        //await ctx.reply(ctx.i18n.t("base.addFileCommand"));
        const file = await createFile(ctx, type);
        let ok = await sendFile(ctx, file);
        return done();
    } catch (err) {
        ctx.reply(ctx.i18n.t("base.fileLoadError"));
        return done();
    }
}).start();