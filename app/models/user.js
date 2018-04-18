const mongoose = require("mongoose");
const { getUserInfo } = require("../utils");

const UserSchema = mongoose.Schema({
    userId: { type: Number, required: true, unique: true },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    username: { type: String, default: "" },
    isBot: { type: Boolean, default: false },
    languageCode: { type: String, default: "ru" },
    created_at: { type: Date, default: Date.now },
});

UserSchema.statics.createByContext = async function(ctx) {
    const userData = getUserInfo(ctx);
    const user = await this.findOne({ userId: userData.userId });
    if (user) return user;

    return this.create(userData);
};

module.exports = mongoose.model("User", UserSchema);