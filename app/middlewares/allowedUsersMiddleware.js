const { localSessionManager: { getData }, isAdmin } = require("../util");

module.exports = () => (ctx, next) => {
    if (isAdmin(ctx) || (ctx.session.allowed || getData(ctx, "allowed"))) 
        return next(ctx);
};