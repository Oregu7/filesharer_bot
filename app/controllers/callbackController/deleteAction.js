const { deleteFile } = require("../../helpers/fileManager");

module.exports = async(ctx) => {
    const fileId = ctx.state.payload;
    await deleteFile(fileId);
    ctx.answerCbQuery("Файл удален!", true);
    return ctx.deleteMessage();
};