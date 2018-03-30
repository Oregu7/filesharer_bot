const { uid } = require("rand-token");
const moment = require("moment");
const { allowedTypes, typesImages } = require("config").get("base");
const { FileModel } = require("../models");

const createInlineQueryResult = (baseType, locale = "ru", link = false) => (file) => {
    const { type, fileId, publicId, name, created_at } = file;
    const result = {
        id: uid(11),
        type: baseType,
        title: name,
        message_text: link ? `https://t.me/filesharer_bot?start=${publicId}` : `/file@${publicId}`,
    };

    if (baseType === "article") {
        result["thumb_url"] = typesImages[type];
        result["description"] = moment(created_at).locale(locale).format("L LT");
    } else result[`${type}_file_id`] = fileId;

    return result;
};

function getQueryData(ctx, query) {
    const author = ctx.session.authToken;
    const indx = query.indexOf(":");
    let type = "article";
    let text = query;
    if (indx !== -1) {
        let typeData = query.slice(0, indx).toLowerCase().trim();
        type = allowedTypes.indexOf(typeData) !== -1 ? typeData : type;
        text = query.slice(indx + 1).trim();
    }

    return { type, text, author };
}

async function answerFileById(ctx, queryData) {
    const results = [];
    const extra = {
        cache_time: 10,
        is_personal: true,
    };
    const file = await FileModel.searchFileById(queryData.text);
    if (file) results.push(createInlineQueryResult(file.type, ctx.i18n.locale(), true)(file));
    else {
        extra["switch_pm_text"] = "Я не нашел данный файл!";
        extra["switch_pm_parameter"] = "file_nexist";
    }

    return ctx.answerInlineQuery(results, extra);
}

module.exports = async(ctx) => {
    const { query, offset } = ctx.inlineQuery;
    const page = offset.length ? Number(offset) : 1;
    const queryData = getQueryData(ctx, query);
    try {
        if (queryData.type === "file") return await answerFileById(ctx, queryData);
        const files = await FileModel.searchFiles(queryData, page);
        const getinlineQueryResult = createInlineQueryResult(queryData.type, ctx.i18n.locale());
        const results = files.docs.map(getinlineQueryResult);
        // доп опции
        let extra = {
            cache_time: 10,
            is_personal: true,
            next_offset: (files.page < files.pages) ? files.page + 1 : "",
        };
        if (!results.length) {
            extra = Object.assign({}, extra, {
                switch_pm_text: "Я не нашел файлы .(",
                switch_pm_parameter: "files",
            });
        }

        return ctx.answerInlineQuery(results, extra);
    } catch (err) {
        console.error(err);
    }
};