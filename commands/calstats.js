const { RULES, PREFIX } = require('./config.json');
const Discord = require('discord.js');
const {google} = require('googleapis');
const gcal = require('./GCal');

module.exports = {
    name: "calstats",
    aliases: ["stats", "list"],
    description: "see stats for a calendar",
    syntax: `${PREFIX}stats [calendar/role] [property] [options]` + "\n" +
            `${PREFIX}stats calendars (<-displays all available calendars)` + "\n" +
            "__**Properties:**__" + "\n" +
            "***events***: ",
    async run(message, args){
        let property = args[0];

        if(property.toLowerCase() === "calendars"){
            const calendars = await gcal.getCalendarList(message.channel);
            let result = new Discord.MessageEmbed().setTitle("Calendars");
            for(const i of calendars.data.items){
                result.addField("----------------------------", i.summary);
            }
            message.channel.send(result);
            return
        }
        
        let option = args[1];
    }
}