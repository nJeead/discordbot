const Discord = require('discord.js');
const { RULES } = require('./config.json');
const cron = require('cron');

module.exports = {
    name: "test",
    description: "only for development process",
    run(message, args){
        console.log("current time: " + new Date().toString());

        //cron formatting
        // * * * * * *
        // | | | | | |
        // | | | | | day of week
        // | | | | month
        // | | | day of month
        // | | hour
        // | minute
        // seconds (optional)
        let sm = new cron.CronJob('18 14 22 5 1', () => {
            console.log("with slash" + new Date().toString());
            message.channel.send("Scheduled message");
                sm.stop();
        });
        sm.start();
        console.log(sm.nextDates(5).map(date => date.toString()));
    }
}