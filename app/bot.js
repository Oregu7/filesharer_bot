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
    defaultLanguage: "ru",
    sessionName: "session",
});
// Create scene manager
const stage = new Stage();
// Scene registration
stage.register(scenes.passwordScene);
// middlewares
bot.use(localSession.middleware());
bot.use(i18n.middleware());
bot.use(stage.middleware());
// commands
bot.start(controllers.startController);
bot.command("add", controllers.addController);
// patterns
// events
bot.on("photo", controllers.addFileController("photo"));
bot.on("video", controllers.addFileController("video"));
bot.on("audio", controllers.addFileController("audio"));
bot.on("voice", controllers.addFileController("voice"));
bot.on("document", controllers.addFileController("document"));

bot.on("callback_query", controllers.callbackController);

bot.catch((err) => {
    console.error(err);
});


module.exports = bot;