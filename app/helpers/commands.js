exports.start = (ctx) => {
    const { i18n } = ctx;
    const startMessage = i18n.t("base.startCommand");
    const commands = i18n.t("base.commandsList");
    const termsOfUse = i18n.t("base.termsOfUse");
    return `${startMessage}\n\n${commands}\n\n${termsOfUse}`;
};