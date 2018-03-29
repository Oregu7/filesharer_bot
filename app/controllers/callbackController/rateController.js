const Markup = require("telegraf/markup");
const {
    SETTINGS_ACTION,
    BACK_ACTION,
    RATE_INFO_ACTION,
    RATE_ON_ACTION,
    RATE_OFF_ACTION,
} = require("config").get("constants");
const { isExistFileMiddleware } = require("../../helpers/fileManager");

function getRadioButton(file, need = false) {
    const { rate } = file.options;
    return rate === need ? "\u{1F518}" : "\u{26AA}";
}

function createRateKeyboard(ctx, file) {
    return Markup.inlineKeyboard([
        [Markup.callbackButton(ctx.i18n.t("rate.infoButton"), `${RATE_INFO_ACTION}:${file._id}`)],
        [
            Markup.callbackButton(
                `${getRadioButton(file, true)}${ctx.i18n.t("rate.onButton")}`,
                `${RATE_ON_ACTION}:${file._id}`
            ),
            Markup.callbackButton(
                `${getRadioButton(file, false)}${ctx.i18n.t("rate.offButton")}`,
                `${RATE_OFF_ACTION}:${file._id}`
            ),
        ],
        [
            Markup.callbackButton(ctx.i18n.t("file.backButton"), `${SETTINGS_ACTION}:${file._id}`),
            Markup.callbackButton(ctx.i18n.t("file.menuButton"), `${BACK_ACTION}:${file._id}`),
        ],
    ]);
}

function switchFileRate(rate = false) {
    return async(ctx, file) => {
        file.options.rate = rate;
        await file.save();
        const keyboard = createRateKeyboard(ctx, file);
        return ctx.editMessageReplyMarkup(keyboard);
    };
}

exports.base = isExistFileMiddleware((ctx, file) => {
    const keyboard = createRateKeyboard(ctx, file);
    return ctx.editMessageReplyMarkup(keyboard);
});

exports.info = (ctx) => {
    return ctx.answerCbQuery(ctx.i18n.t("rate.infoCbMessage"), true);
};

exports.on = isExistFileMiddleware(switchFileRate(true));
exports.off = isExistFileMiddleware(switchFileRate(false));