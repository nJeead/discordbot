const Discord = require('discord.js');
const { PREFIX, RULES } = require('./config.json');
// const cron = require("cron");
const {Event} = require('./eventObject');

module.exports = {
    name: "event",
    description: "create a new event to invite people to",
    syntax: `${PREFIX}event <name> <mm/dd or day>(date) <HH:mm>(time) <@guest1 @guest2 ...>(invites)`,
    run(message, args){
        if(args.length === 0){
            channel.send("Proper syntax: " + this.syntax);
            return;
        }

        const channel = message.channel;
        let name = args[0];
        let date = args[1].split('/');
        let time = args[2].split(':');

        let now = new Date();
        let eventdate = new Date(now.getFullYear(), (date[0]-1), date[1], time[0], time[1]);

        let event = new Event(name, time, channel);
        // let cronFormat = time[1] + " "+ time[0] + " " + date[1]  + " "+ (date[0]-1) + " " + eventdate.getDay();

        event.scheduleEvent(eventdate);

        channel.send(`Event Scheduled at ${eventdate}`);
    }
}