const Router = require("telegraf/router");
const {
    SETTINGS_ACTION,
    STATISTICS_ACTION,
    REMOVE_ACTION,
    DELETE_ACTION,
    BACK_ACTION,
    PASSWORD_ACTION,
} = require("config").get("constants");
const { enter } = require("telegraf/stage");
// actions
const switchToMenuAction = require("./switchToMenuAction");
const deleteAction = require("./deleteAction");

// router
const callback = new Router(({ callbackQuery }) => {
    if (!callbackQuery.data) { return; }
    const parts = callbackQuery.data.split(":");
    const result = {
        route: parts[0],
        state: { payload: parts[1] },
    };
    return result;
});

callback.on(REMOVE_ACTION, switchToMenuAction(REMOVE_ACTION));
callback.on(SETTINGS_ACTION, switchToMenuAction(SETTINGS_ACTION));
callback.on(STATISTICS_ACTION, switchToMenuAction(STATISTICS_ACTION));
callback.on(BACK_ACTION, switchToMenuAction("main"));

callback.on(PASSWORD_ACTION, enter(PASSWORD_ACTION));
callback.on(DELETE_ACTION, deleteAction);

module.exports = callback;