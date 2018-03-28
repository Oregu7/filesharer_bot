const { createKeyboard } = require("../../helpers/fileManager");

module.exports = (type = "main") => (ctx) => {
    const fileId = ctx.state.payload;
    const keyboard = createKeyboard(ctx, fileId, type);
    return ctx.editMessageReplyMarkup(keyboard);
};