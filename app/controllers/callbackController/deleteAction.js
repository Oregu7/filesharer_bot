const { deleteFile } = require("../../helpers/fileManager");

module.exports = async(ctx) => {
    const fileId = ctx.state.payload;
    await deleteFile(fileId);
    ctx.answerCbQuery(ctx.i18n.t("base.deleteAction"), true);
    return ctx.deleteMessage();
};