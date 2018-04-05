const mongoose = require("mongoose");
const { createUserKeyboard, deleteMessage } = require("../../helpers/fileManager");
const { FileModel } = require("../../models");

function rateFile(assessment = "likes") {
    return async(ctx) => {
        const id = ctx.state.payload;
        ctx.answerCbQuery(ctx.i18n.t("rate.assessmentCbMessage", { assessment }));

        await FileModel.rateFile(ctx, assessment);
        const file = await FileModel.getFileToUser({ _id: mongoose.Types.ObjectId(id) });
        if (!file) return deleteMessage(ctx);

        const keyboard = createUserKeyboard(ctx, file);
        return ctx.editMessageReplyMarkup(keyboard);
    };
}

exports.like = rateFile("likes");
exports.dislike = rateFile("dislikes");