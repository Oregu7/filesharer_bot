const escape = require("escape-html");

module.exports = (ctx) => {
    const {
        id: userId,
        is_bot: isBot,
        first_name: firstName,
        last_name: lastName,
        username,
        language_code: languageCode,
    } = ctx.from;

    return {
        userId,
        isBot,
        firstName: escape(firstName),
        lastName: escape(lastName),
        username,
        languageCode,
    };
};