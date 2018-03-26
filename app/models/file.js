const mongoose = require("mongoose");
const shortid = require("shortid");

const FileSchema = mongoose.Schema({
    fileId: { type: String, required: true, unique: true},
    name: { type: String, required: true },
    type: { type: String, required: true},
    author: { type: Number, required: true},
    publicId: { type: String, unique: true, default: shortid.generate},
    created_at: { type: Date, default: Date.now},
    // можно защитить паролем
    password: { type: String, default: ""},
    // опции, как будет отображаться файл у людей
    options: {
        author: { type: Boolean, default: false},
        date: { type: Boolean, default: false},
        // колличество просмотров
        look_count: { type: Boolean, default: false},
    },
    // тэги
    tags: [String],
    // лайки и дизлайки
    rate: {
        show: { type: Boolean, default: false},
        likes: [Number],
        dislikes: [Number],
    },
    // люди, которые перешли по ссылке
    users: [Number],
});

module.exports = mongoose.model("File", FileSchema);