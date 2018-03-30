const Router = require("telegraf/router");
const {
    SETTINGS_ACTION,
    STATISTICS_ACTION,
    STATISTICS_CSV_ACTION,
    STATISTICS_JSON_ACTION,
    STATISTICS_XML_ACTION,
    STATISTICS_XLSX_ACTION,
    REMOVE_ACTION,
    DELETE_ACTION,
    BACK_ACTION,
    RATE_ACTION,
    RATE_INFO_ACTION,
    RATE_ON_ACTION,
    RATE_OFF_ACTION,
    PASSWORD_ACTION,
    LIKE_ACTION,
    DISLIKE_ACTION,
} = require("config").get("constants");
const { enter } = require("telegraf/stage");
// actions
const switchToMenuAction = require("./switchToMenuAction");
const deleteAction = require("./deleteAction");
const rateActions = require("./rateController");
const statisticsActions = require("./statisticsController");

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
callback.on(RATE_ACTION, rateActions.base);
callback.on(RATE_INFO_ACTION, rateActions.info);
callback.on(RATE_ON_ACTION, rateActions.on);
callback.on(RATE_OFF_ACTION, rateActions.off);
callback.on(LIKE_ACTION, rateActions.like);
callback.on(DISLIKE_ACTION, rateActions.dislike);
callback.on(STATISTICS_CSV_ACTION, statisticsActions.csv);
callback.on(STATISTICS_JSON_ACTION, statisticsActions.json);
callback.on(STATISTICS_XLSX_ACTION, statisticsActions.xlsx);
callback.on(STATISTICS_XML_ACTION, statisticsActions.xml);
callback.on(DELETE_ACTION, deleteAction);

module.exports = callback;