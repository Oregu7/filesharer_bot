const { LANG_SCENE } = require("config").get("constants");
const { UserModel } = require("../models");
const { startRouterDispatch } = require("../helpers");


module.exports = async(ctx) => {
    const parts = ctx.message.text.split(" ");
    const route = parts[1] || "/";

    if (!ctx.session.hasOwnProperty("authToken")) {
        let user = await UserModel.createByContext(ctx);
        console.log(`[ new client ] => ${user.username}:${user.userId}`);
        ctx.session.authToken = user._id;
        return ctx.scene.enter(LANG_SCENE, { route });
    }

    return startRouterDispatch(ctx, route);
};