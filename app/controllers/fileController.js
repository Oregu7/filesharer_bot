const { FileModel } = require("../models");
const { sendFile } = require("../helpers").fileManager;

module.exports = async(ctx) => {
    const [, publicId] = ctx.match;
    const { id: userId } = ctx.message.from;
    const file = await FileModel.findOne({ publicId })
        .select("type fileId publicId name created_at author")
        .populate({
            path: "author",
            select: "userId",
        });

    if (file && file.author.userId === userId) return sendFile(ctx, file);
    else return ctx.reply(ctx.i18n.t("base.getFileCommand"));
};