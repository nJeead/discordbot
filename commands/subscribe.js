const { PREFIX } = require('./config.json');
const Discord = require('discord.js');
const gcal = require('./GCal');

module.exports = {
    name: "subscribe",
    aliases: ["sub"],
    description: "subscribe to a specific role/class calendar",
    syntax: `${PREFIX}sub [@role] [your email]`,
    async run(message, args) {
        const calname = gcal.gcalmap.get(message.mentions.roles.first());
        const email = args[1];
        if(!calname){
            message.channel.send(`Calendar does not exists, please request for the role/calendar to be created using '${PREFIX}request'`);
            return;
        }
        if(!email) {
            message.channel.send("Please enter your email");
            return;
        }

        // add email to calendar ACL and return if successful or not
        const res = await gcal.newSubscription(calname, email);
        if(res === "done"){
            message.react("👍");
        } else {
            message.channel.send("Something went wrong: " + res);
        }
    }
}