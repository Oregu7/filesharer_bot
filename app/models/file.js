const mongoose = require("mongoose");
const shortid = require("shortid");

const FileSchema = mongoose.Schema({
    fileId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    author: {
        userId: { type: Number, required: true },
        username: { type: String, default: "" },
        lasName: { type: String, default: "" },
        firstName: { type: String, default: "" },
        isBot: { type: Boolean, default: false },
        languageCode: { type: String, default: "ru" },
    },
    publicId: { type: String, unique: true, default: shortid.generate },
    created_at: { type: Date, default: Date.now },
    // можно защитить паролем
    password: { type: String, default: "" },
    // опции, как будет отображаться файл у людей
    options: {
        author: { type: Boolean, default: false },
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
        userId: { type: Number, required: true },
        username: { type: String, default: "" },
        lasName: { type: String, default: "" },
        firstName: { type: String, default: "" },
        isBot: { type: Boolean, default: false },
        languageCode: { type: String, default: "ru" },
        date: { type: Date, default: Date.now },
    }],
});

module.exports = mongoose.model("File", FileSchema);