const { setLanguage } = require("../../helpers").langManager;

module.exports = (ctx) => {
    const langCode = ctx.state.payload;
    return setLanguage(ctx, langCode);
};