module.exports = {
    name: "ping",
    description: "Display latency from the bots",
    usage: "ping",
    aliases: [],
    permissions: [],
    async execute(msg, args) {
        msg.channel.send(`:ping_pong: Pong \`${Date.now() - msg.createdTimestamp}ms\`. API Latency is \`${Math.round(msg.client.ws.ping)}ms\``);
    },
};