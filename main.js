const localtunnel = require("localtunnel");
const Koa = require("koa");
const koaBody = require("koa-body");
const token = require("config").get("bot.token");
const bot = require("./app/bot");

const tunnel = localtunnel(3000, function(err, tunnel) {
    if (err) console.error(err);

    bot.telegram.setWebhook(`${tunnel.url}/bot-${token}`);
    const app = new Koa();
    app.use(koaBody());
    app.use((ctx, next) => ctx.method === "POST" || ctx.url === `/bot-${token}` ?
        bot.handleUpdate(ctx.request.body, ctx.response) :
        next()
    );
    app.listen(3000);
});

tunnel.on("close", function() {
    console.log("tunnels are closed");
});