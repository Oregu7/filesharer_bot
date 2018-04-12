const { isAdmin } = require("../util");

module.exports = (callback) => (ctx) => {
    if (isAdmin(ctx)) return callback(ctx);
};