const Router = require("telegraf/router");
const {
    SETTINGS_ACTION,
    STATISTICS_ACTION,
    STATISTICS_CSV_ACTION,
    STATISTICS_JSON_ACTION,
    STATISTICS_XML_ACTION,
    STATISTICS_XLSX_ACTION,
    STATISTICS_INFO_ACTION,
    REMOVE_ACTION,
    DELETE_ACTION,
    BACK_ACTION,
    OPTIONS_ACTION,
    OPTION_INFO_ACTION,
    OPTION_ON_ACTION,
    OPTION_OFF_ACTION,
    PASSWORD_ACTION,
    LANG_ACTION,
    LIKE_ACTION,
    SAVE_ACTION,
    NAME_ACTION,
    DISLIKE_ACTION,
    NAME_SCENE,
    PASSWORD_SCENE,
} = require("config").get("constants");
const { enter } = require("telegraf/stage");
// actions
const switchToMenuAction = require("./switchToMenuAction");
const deleteAction = require("./deleteAction");
const rateActions = require("./rateController");
const statisticsActions = require("./statisticsController");
const langAction = require("./langAction");
const saveAction = require("./saveAction");
const optionalAction = require("./optionalAction");

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

callback.on(PASSWORD_ACTION, enter(PASSWORD_SCENE));
callback.on(NAME_ACTION, enter(NAME_SCENE));
callback.on(LIKE_ACTION, rateActions.like);
callback.on(DISLIKE_ACTION, rateActions.dislike);
callback.on(STATISTICS_CSV_ACTION, statisticsActions.csv);
callback.on(STATISTICS_JSON_ACTION, statisticsActions.json);
callback.on(STATISTICS_XLSX_ACTION, statisticsActions.xlsx);
callback.on(STATISTICS_XML_ACTION, statisticsActions.xml);
callback.on(STATISTICS_INFO_ACTION, statisticsActions.info);

callback.on(OPTIONS_ACTION, optionalAction.base);
callback.on(OPTION_INFO_ACTION, optionalAction.info);
callback.on(OPTION_ON_ACTION, optionalAction.on);
callback.on(OPTION_OFF_ACTION, optionalAction.off);

callback.on(SAVE_ACTION, saveAction);
callback.on(LANG_ACTION, langAction);
callback.on(DELETE_ACTION, deleteAction);

callback.otherwise((ctx) => ctx.answerCbQuery());

module.exports = callback;