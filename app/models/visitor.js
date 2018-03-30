const mongoose = require("mongoose");
const { getUserInfo } = require("../util");
const { ObjectId } = mongoose.Schema.Types;

const VisitorSchema = mongoose.Schema({
    userId: { type: Number, required: true, index: true },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    username: { type: String, default: "" },
    isBot: { type: Boolean, default: false },
    languageCode: { type: String, default: "ru" },
    date: { type: Date, default: Date.now, index: true },
    fileId: { type: ObjectId, ref: "File", index: true },
});

VisitorSchema.statics.registerVistor = async function(ctx, file) {
    const userData = getUserInfo(ctx);
    const data = Object.assign({}, userData, { fileId: file._id });
    return await this.create(data);
};

VisitorSchema.statics.getVisitors = async function(ctx) {
    const id = ctx.state.payload;
    const visitors = await this.find({ fileId: id })
        .select("-_id -__v -fileId")
        .sort("-date")
        .limit(300);

    return visitors.map((visitor) => visitor.toObject());
};

VisitorSchema.statics.getVisitorsCount = function(id) {
    return this.find({ fileId: id })
        .sort("-date")
        .count();
};

module.exports = mongoose.model("Visitor", VisitorSchema);