const { createFile, sendFile } = require("../helpers").fileManager;

module.exports = (type) => async(ctx) => {
    await ctx.reply("Загружаю файл...");
    const file = await createFile(ctx, type);
    return sendFile(ctx, file);
};