const mongoose = require("mongoose");
const { FileModel } = require("../../models");
const { createUserKeyboard } = require("../../helpers").fileManager;

module.exports = (assessment = "likes") => async(ctx) => {
    const id = ctx.state.payload;
    const ok = await FileModel.rateFile(ctx, assessment);
    console.log(ok);
    const file = await FileModel.getFileToUser({ _id: mongoose.Types.ObjectId(id) });
    const keyboard = createUserKeyboard(ctx, file);
    return ctx.editMessageReplyMarkup(keyboard);
};