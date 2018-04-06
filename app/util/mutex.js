const EventEmitter = require("events").EventEmitter;

const _queues = Symbol("queues");
const _callback = Symbol("callback");
const _dequeue = Symbol("dequeue");
const _getQueue = Symbol("getQueue");

class Mutex extends EventEmitter {
    constructor(callback) {
        super();
        this[_queues] = {};
        this[_callback] = callback;
        this.on("dequeue", this[_dequeue].bind(this));
    }

    done(ctx) {
        const { queue, id } = this[_getQueue](ctx);
        queue.done = true;
        console.log(`[${id}] => done`);
        this.emit("dequeue", ctx);
    }

    enqueue(ctx, ...args) {
        const { queue } = this[_getQueue](ctx);
        //добавляем данные в очередь
        queue.stack.push({ ctx, args });
        if (queue.done) this.emit("dequeue", ctx);
    }

    async [_dequeue](ctx) {
        const { queue } = this[_getQueue](ctx);
        if (queue.stack.length && queue.done) {
            queue.done = false;
            let { ctx, args } = queue.stack.shift();
            this[_callback](ctx, this.done.bind(this, ctx), ...args);
        }
    }

    [_getQueue](ctx) {
        const { id } = ctx.message.from;
        if (!this[_queues].hasOwnProperty(id)) {
            this[_queues][id] = {
                done: true,
                stack: [],
            };
        }
        return { id, queue: this[_queues][id] };
    }

    start() {
        return this.enqueue.bind(this);
    }
}

module.exports = Mutex;