const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");
const {
    SETTINGS_ACTION,
    BACK_ACTION,
    OPTION_INFO_ACTION,
    OPTION_ON_ACTION,
    OPTION_OFF_ACTION,
} = require("config").get("constants");
const { isExistFileMiddleware, createCaption, deleteMessage, getFileById } = require("../../helpers/fileManager");
const { FileModel } = require("../../models");

// вид переключателя (need => (on = true, off = false))
function getRadioButton(file, optionName, need = false) {
    const value = file.options[optionName];
    return value === need ? "\u{1F518}" : "\u{26AA}";
}

function createOptionButtons(ctx, file, optionName) {
    const { i18n } = ctx;
    return [
        [Markup.callbackButton(i18n.t(`options.infoButton.${optionName}`), `${OPTION_INFO_ACTION}:${optionName}`)],
        [
            Markup.callbackButton(
                `${getRadioButton(file, optionName, true)}${i18n.t("options.onButton")}`,
                `${OPTION_ON_ACTION}:${file._id};${optionName}`
            ),
            Markup.callbackButton(
                `${getRadioButton(file, optionName, false)}${i18n.t("options.offButton")}`,
                `${OPTION_OFF_ACTION}:${file._id};${optionName}`
            ),
        ],
    ];
}

function createOptionsKeyboard(ctx, file) {
    const { i18n } = ctx;
    return Markup.inlineKeyboard([
        ...createOptionButtons(ctx, file, "rate"),
        ...createOptionButtons(ctx, file, "link"),
        ...createOptionButtons(ctx, file, "name"),
        ...createOptionButtons(ctx, file, "author"), [
            Markup.callbackButton(i18n.t("file.backButton"), `${SETTINGS_ACTION}:${file._id}`),
            Markup.callbackButton(i18n.t("file.menuButton"), `${BACK_ACTION}:${file._id}`),
        ],
    ]);
}

function switchFileOption(value = false) {
    return async(ctx) => {
        const [id, optionName] = ctx.state.payload.split(";");
        const file = await getFileById(id);
        if (!file) return deleteMessage(ctx);

        file.options[optionName] = value;
        const keyboard = createOptionsKeyboard(ctx, file);
        const caption = createCaption(ctx, file);
        if (caption.length > 200) return ctx.answerCbQuery(ctx.i18n.t("options.limitExceeded"), true);

        await file.save();
        return ctx.editMessageCaption(caption, Extra.HTML().markup(keyboard));
    };
}

exports.base = isExistFileMiddleware((ctx, file) => {
    const keyboard = createOptionsKeyboard(ctx, file);
    return ctx.editMessageReplyMarkup(keyboard);
});

exports.info = (ctx) => {
    const optionName = ctx.state.payload;
    return ctx.answerCbQuery(ctx.i18n.t(`options.infoCbMessage.${optionName}`), true);
};

exports.on = switchFileOption(true);
exports.off = switchFileOption(false);