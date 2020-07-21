const { RULES, PREFIX } = require('./config.json');
const Discord = require('discord.js');
const {google} = require('googleapis');
const gcal = require('./GCal');

module.exports = {
    name: "calstats",
    aliases: ["stats", "list"],
    description: "displays stats for a calendar",
    syntax: "\n" +`${PREFIX}stats [calendar/role] [property] [option]` + "\n" +
            `${PREFIX}stats calendars (<-displays all available calendars)` + "\n" +
        "__**Properties:**__" + "\n" +
            "\t***due***: all options apply" + "\n" +
            "\t***exams***: no options, lists all exams" + "\n" +
        "__**Options:**__" + "\n" +
            "\t***today***: " + "\n" +
            "\t***tomorrow***: " + "\n" +
            "\t***week***: " + "\n"+
            "\t***all***: ",
    async run(message, args){
        if(args.length < 1){
            message.channel.send("Please enter the required parameters: " + this.syntax);
            return;
        }
        let calName = args[0];

        if(calName.toLowerCase() === "calendars"){
            const calendars = await gcal.getCalendarList();
            let result = new Discord.MessageEmbed().setTitle("Calendars");
            if(calendars.data.items.length <= 1){
                result.setDescription("No calendars available at the moment");
                message.channel.send(result);
                return;
            }
            for(const i of calendars.data.items){
                if(!i.summary.includes("utecediscord@gmail.com")){
                    result.addField("----------------------------", i.summary);
                }
            }
            message.channel.send(result);
            return
        }

        let property = args[1];
        if(!property){
            message.channel.send("Please enter [property] parameter");
            return;
        }
        const calID = gcal.gcalmap.get(message.guild.roles.cache.find(role => role.name === calName).id);
        const events = await gcal.getCalendarEvents(calID)
        if(property.toLowerCase() === "exams"){
            let examlist = new Discord.MessageEmbed().setTitle("Exams").setColor("DARK_RED");

            for(const i of events.data.items){
                if(i.summary.toLowerCase().includes("exam") || i.summary.toLowerCase().includes("test") ||
                    i.description.toLowerCase().includes("exam") || i.description.toLowerCase().includes("test")){
                    let dateArr = i.start.dateTime.match(new RegExp("(.*?)T(.*?)-"));
                    let formatTime = this.formatTime(dateArr[2]);
                    examlist.addField(`**${i.summary}**`, `*${dateArr[1]} ${formatTime.join(":")}*` + ' \n ' + i.description);
                }
            }
            message.channel.send(examlist);
        } else if(property.toLowerCase() === "due") {
            let opt = args[2];
            if(!opt) {
                message.channel.send("Please enter [options] parameter");
                return;
            }
            let maxDate = new Date();

            switch (opt) {
                case("today"):
                    break;
                case("tom"):
                case("tomorrow"):
                    maxDate.setDate(maxDate.getDate()+1);
                    break;
                case("week"):
                    maxDate.setDate(maxDate.getDate()+7);
                    break;
                default:
                    maxDate = null
                    break;
            }

            message.channel.send(this.getEvents(maxDate, events.data.items));
        }
    },
    getEvents(maxDate, events){
        let eventList = new Discord.MessageEmbed().setTitle("Events");
        if(!maxDate){
            for(const i of events){
                let dateArr = i.start.dateTime.match(new RegExp("(.*?)T(.*?)-"));
                let formatTime = this.formatTime(dateArr[2]);
                eventList.addField(`**${i.summary}**`, `*${dateArr[1]} ${formatTime.join(":")}*` + ' \n ' + i.description);
            }
            return eventList;
        } else {
            for(const i of events){
                if(!i.start.dateTime){
                    let startDate = new Date(i.start.date);
                    if(startDate.getTime() > maxDate.getTime()){
                        break;
                    }
                    eventList.addField(`**${i.summary}**`, `*${i.start.date}*` + ' \n ' + i.description);
                    continue;
                }
                let startDate = new Date(i.start.dateTime);
                if(startDate.getTime() > maxDate.getTime()){
                    break;
                }
                let dateArr = i.start.dateTime.match(new RegExp("(.*?)T(.*?)-"));
                let formatTime = this.formatTime(dateArr[2]);
                eventList.addField(`**${i.summary}**`, `*${dateArr[1]} ${formatTime.join(":")}*` + ' \n ' + i.description);
            }
            return eventList;
        }
    },
    formatTime(time){
        let formatTime = time.split(":");
        if(parseInt(formatTime[0])>12){
            formatTime[0] = (parseInt(formatTime[0])-12).toString();
            formatTime.push("pm");
        } else {
            formatTime.push("am");
        }
        return formatTime;
    }
}