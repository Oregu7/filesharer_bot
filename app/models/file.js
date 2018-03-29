const mongoose = require("mongoose");
const shortid = require("shortid");
const { ObjectId } = mongoose.Schema.Types;

const FileSchema = mongoose.Schema({
    fileId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    type: { type: String, required: true },
    author: { type: ObjectId, ref: "User" },
    publicId: { type: String, unique: true, default: shortid.generate },
    created_at: { type: Date, default: Date.now },
    // можно защитить паролем
    password: { type: String, default: "" },
    publicAccess: { type: Boolean, default: false },
    // опции, как будет отображаться файл у людей
    options: {
        author: {
            username: { type: Boolean, default: false },
            lastName: { type: Boolean, default: false },
            firstName: { type: Boolean, default: false },
        },
        date: { type: Boolean, default: false },
        // колличество просмотров
        count: { type: Boolean, default: false },
        // возможность лайкать/дизлайкать
        rate: { type: Boolean, default: false },
    },
    // тэги
    tags: [String],
    // лайки и дизлайки
    likes: [Number],
    dislikes: [Number],
    // люди, которые перешли по ссылке
    users: [{
        user: { type: ObjectId, ref: "User" },
        date: { type: Date, default: Date.now },
    }],
});

FileSchema.statics.getFileToUser = async function(query = {}) {
    const [file = null] = await this.aggregate([
        { "$match": query },
        {
            $project: {
                item: 1,
                password: 1,
                fileId: 1,
                type: 1,
                publicId: 1,
                options: 1,
                likesCount: { $size: "$likes" },
                dislikesCount: { $size: "$dislikes" },
            },
        },
    ]);

    return file;
};

FileSchema.statics.registerView = async function(ctx, file) {
    const userId = ctx.session.authToken;
    return await this.update({ _id: file._id }, { $push: { users: { user: userId } } });
};

FileSchema.statics.rateFile = function(ctx, assessment = "likes") {
    const id = ctx.state.payload;
    const pullField = assessment == "likes" ? "dislikes" : "likes";
    const { id: userId } = ctx.update.callback_query.from;
    return this.update({ _id: mongoose.Types.ObjectId(id) }, {
        "$addToSet": {
            [assessment]: Number(userId),
        },
        "$pull": {
            [pullField]: Number(userId),
        },
    });
};

module.exports = mongoose.model("File", FileSchema);