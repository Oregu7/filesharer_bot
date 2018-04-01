const request = require("request");
const { createFile, sendFile } = require("../helpers").fileManager;

module.exports = (ctx) => {
    return ctx.replyWithDocument({
        url: "http://azy-economiki.ru/docs/the_basics_of_Economics.pdf",
    });
};