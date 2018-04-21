const config = require("config");
const env = config.get("env");
const bot = require("./app/bot");
//start bot
if (env === "development") {
    bot.telegram.setWebhook();
    bot.startPolling();
} else {
    const url = process.env.APP_URL || "https://filesharer-bot.herokuapp.com:443";
    const port = process.env.PORT;
    // Set telegram webhook
    bot.telegram.setWebhook(url);
    // Http webhook, for nginx/heroku users.
    bot.startWebhook("/", null, port);
}