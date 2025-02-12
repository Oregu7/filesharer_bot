const config = require("config");
const Telegraf = require("telegraf");
const Stage = require("telegraf/stage");
const I18n = require("telegraf-i18n");
const controllers = require("./controllers");
const scenes = require("./scenes");
const { allowedUsersMiddleware } = require("./middlewares");

// configure
const { localSession } = require("./utils");
const token = config.get("bot.token");
const bot = new Telegraf(token);
const i18n = new I18n({
    directory: config.get("bot.localesPath"),
    defaultLanguage: "ru",
    useSession: true,
});
// Create scene manager
const stage = new Stage(scenes);
// middlewares
bot.use(localSession.middleware());
bot.use(i18n.middleware());
// allowed users
bot.hears(/^[A-z0-9]{33}$/, controllers.tokenController.authorizeByToken);
bot.use(allowedUsersMiddleware());
// stage scenes
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
bot.command("token", controllers.tokenController.generateToken);
// patterns
bot.hears(/^\/file@([A-z0-9_-]+)$/, controllers.fileController);
// events
bot.on("photo", controllers.addFileController("photo"));
bot.on("video", controllers.addFileController("video"));
bot.on("audio", controllers.addFileController("audio"));
bot.on("voice", controllers.addFileController("voice"));
bot.on("document", controllers.addFileController("document"));

bot.on("callback_query", controllers.callbackController);
bot.on("inline_query", controllers.inlineQueryController);

bot.catch((err) => {
    console.error(err);
});

module.exports = bot;