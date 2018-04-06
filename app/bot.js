const config = require("config");
const path = require("path");
const Telegraf = require("telegraf");
const Stage = require("telegraf/stage");
const I18n = require("telegraf-i18n");
const controllers = require("./controllers");
const scenes = require("./scenes");

// configure
const localSession = require("./util/localSession");
const token = config.get("bot.token");
const bot = new Telegraf(token);
const i18n = new I18n({
    directory: path.resolve(__dirname, "locales"),
    defaultLanguage: "en",
    useSession: true,
});
// Create scene manager
const stage = new Stage(scenes);
// middlewares
bot.use(localSession.middleware());
bot.use(i18n.middleware());
bot.use(stage.middleware());
// commands
bot.start(controllers.startController);
bot.command("add", controllers.addController);
bot.command("files", controllers.filesController);
bot.command("lang", controllers.langController);
bot.command("rate", controllers.rateController);
bot.command("feedback", controllers.feedbackController);
bot.command("help", controllers.helpController);
bot.command("down", controllers.downloadConreoller);
// patterns
bot.hears(/^\/file@([A-z0-9_-]+)$/, controllers.fileController);
// events
bot.on("photo", (ctx) => {
    console.log(ctx.message.photo);
    controllers.addFileController("photo")(ctx);
});
bot.on("video", controllers.addFileController("video"));
bot.on("audio", controllers.addFileController("audio"));
bot.on("voice", controllers.addFileController("voice"));
bot.on("document", controllers.addFileController("document"));

bot.on("callback_query", controllers.callbackController);
bot.on("inline_query", controllers.inlineQueryController);

bot.on("message", (ctx) => {
    console.log(ctx.message);
});

bot.catch((err) => {
    console.error(err);
});


module.exports = bot;