const Scene = require("telegraf/scenes/base");
const { LANG_SCENE, LANG_ACTION } = require("config").get("constants");
const { langManager, startRouterDispatch } = require("../helpers");

const langScene = new Scene(LANG_SCENE);

function leaveScene(ctx) {
    const route = ctx.scene.state.route;
    ctx.scene.reset();
    return startRouterDispatch(ctx, route, false);
}

// base actions
langScene.enter((ctx) => {
    return langManager.sendLanguagesList(ctx);
});

// events
langScene.on("message", langManager.sendLanguagesList);

langScene.action(`${LANG_ACTION}:ru`, (ctx) => {
    langManager.setLanguage(ctx, "ru");
    return leaveScene(ctx);
});

langScene.action(`${LANG_ACTION}:en`, (ctx) => {
    langManager.setLanguage(ctx, "en");
    return leaveScene(ctx);
});

module.exports = langScene;