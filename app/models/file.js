const mongoose = require("mongoose");
const { isMongoId } = require("validator");
const mongoosePaginate = require("mongoose-paginate");
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
        author: { type: Boolean, default: false },
        name: { type: Boolean, default: false },
        link: { type: Boolean, default: true },
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
});

FileSchema.plugin(mongoosePaginate);

FileSchema.statics.getFileToUser = async function(query = {}) {
    const [file = null] = await this.aggregate([
        { "$match": query },
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author",
            },
        },
        { "$unwind": "$author" },
        {
            $project: {
                author: "$author",
                item: 1,
                password: 1,
                fileId: 1,
                type: 1,
                publicId: 1,
                options: 1,
                name: 1,
                likesCount: { $size: "$likes" },
                dislikesCount: { $size: "$dislikes" },
            },
        },
    ]);

    return file;
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

FileSchema.statics.searchFiles = function({ author, type = "article", text }, page = 1, limit = 25) {
    const pattern = new RegExp(text, "i");
    const req = { author, name: pattern };
    if (type !== "article") req["type"] = type;

    return this.paginate(req, {
        select: "type fileId publicId name created_at",
        sort: "-created_at",
        limit,
        page,
    });
};

FileSchema.statics.searchFileById = async function(id) {
    if (!isMongoId(id)) return null;
    return await this.findById(id).select("type fileId publicId name created_at");
};

module.exports = mongoose.model("File", FileSchema);