const config = require("config");
const path = require("path");
const Telegraf = require("telegraf");
const I18n = require("telegraf-i18n");
const controllers = require("./controllers");
// const middlewares = require("./middlewares");
const localSession = require("./util/localSession");
// configure
const token = config.get("bot.token");
const bot = new Telegraf(token);
const i18n = new I18n({
    directory: path.resolve(__dirname, "locales"),
    defaultLanguage: "ru",
    sessionName: "session",
});
// middlewares
bot.use(localSession.middleware());
bot.use(i18n.middleware());
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