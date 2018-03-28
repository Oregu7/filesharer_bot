const randomize = require("randomatic");
const { FileModel } = require("../models");
const { getUserInfo } = require("../util");

async function createFile(ctx, type) {
    const [{
        file_id: fileId,
        file_name: fileName = `${type.toUpperCase()} ${randomize("0", 5)}`,
    }] = ctx.message[type].slice(-1);
    const author = getUserInfo(ctx);

    const file = await FileModel.create({
        fileId,
        type,
        author,
        name: fileName,
    });

    return file;
}