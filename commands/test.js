const Discord = require('discord.js');
const { RULES } = require('./config.json');
const cron = require('cron');

module.exports = {
    name: "test",
    description: "only for development process",
    run(message, args){
        let day = "";
        // switch (args[0]) {
        //     case "Sun":
        //     case "Sunday":
        //         day = 0;
        //         break;
        //     case "Mon":
        //         day = 1;
        //         break;
        //     case "Tues":
        //         day = 2;
        //         break;
        //     case "Wed":
        //         day = 3;
        //         break;
        //     case "Thurs":
        //         day = 4;
        //         break;
        //     case "Fri":
        //         day = 5;
        //         break;
        //     case "Sat":
        //         day = 6;
        //         break;
        //     default:
        //         day = -1;
        // }
        message.channel.send(`The day chosen is ${day}`);

        // console.log("current time: " + new Date().toString());
        //
        // //cron formatting
        // // * * * * * *
        // // | | | | | |
        // // | | | | | day of week
        // // | | | | month
        // // | | | day of month
        // // | | hour
        // // | minute
        // // seconds (optional)
        // let sm = new cron.CronJob('18 14 22 5 1', () => {
        //     console.log("with slash" + new Date().toString());
        //     message.channel.send("Scheduled message");
        //         sm.stop();
        // });
        // sm.start();
        // console.log(sm.nextDates(5).map(date => date.toString()));
    }
}