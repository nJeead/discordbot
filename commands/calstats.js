const { RULES, PREFIX } = require('./config.json');
const Discord = require('discord.js');
// const {google} = require('googleapis');
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

        // lists all available calendars that can be subscribed to
        if(calName.toLowerCase() === "calendars"){
            const calendars = await gcal.getCalendarList();         // wait for gAPI to send calendar list
            let result = new Discord.MessageEmbed().setTitle("Calendars");

            if(calendars.data.items.length <= 1){                   // if no calendars available
                result.setDescription("No calendars available at the moment");
                message.channel.send(result);
                return;
            }

            for(const i of calendars.data.items){                   // populates Embedded message with calendars
                if(!i.summary.includes("utecediscord@gmail.com")){
                    result.addField("----------------------------", i.summary);
                }
            }
            message.channel.send(result);
            return;
        }

        let property = args[1];
        if(!property){
            message.channel.send("Please enter [property] parameter");
            return;
        }

        // searches through roles to find the roleID then gets calendarID using the roleID
        const calID = gcal.gcalmap.get(message.guild.roles.cache.find(role => role.name === calName).id);
        const events = await gcal.getCalendarEvents(calID);             // wait for gAPI to return calendar events
        if(property.toLowerCase() === "exams"){     // lists calendar events that are exams
            let examlist = new Discord.MessageEmbed().setTitle("Exams").setColor("DARK_RED");

            // populates Embedded message with events that have 'exam' or 'test' in the name or description
            for(const i of events.data.items){
                if(i.summary.toLowerCase().includes("exam") || i.summary.toLowerCase().includes("test") ||
                    i.description.toLowerCase().includes("exam") || i.description.toLowerCase().includes("test")){

                    let dateArr = i.start.dateTime.match(new RegExp("(.*?)T(.*?)-"));
                    let formatTime = this.formatTime(dateArr[2]);
                    examlist.addField(`**${i.summary}**`, `*${dateArr[1]} ${formatTime.join(":")}*` + ' \n ' + i.description);
                }
            }
            message.channel.send(examlist);

        } else if(property.toLowerCase() === "due") {       // populates message with events that are not exams
            let opt = args[2];
            if(!opt) {
                message.channel.send("Please enter [options] parameter");
                return;
            }
            let maxDate = new Date(); // placeholder for max date

            // only gets events up to a certain date, otherwise, displays all events
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
        // if no maxDate is given, displays all events in calendar
        if(!maxDate){
            for(const i of events){
                let dateArr;
                if(!i.start.dateTime){      // if event only has a date
                    eventList.addField(`**${i.summary}**`, `*${i.start.date}*` + ' \n ' + i.description);
                } else {                    // if event has a date and time
                    dateArr = i.start.dateTime.match(new RegExp("(.*?)T(.*?)-")); // parse the dateTime
                    let formatTime = this.formatTime(dateArr[2]); // prettify the time
                    eventList.addField(`**${i.summary}**`, `*${dateArr[1]} ${formatTime.join(":")}*` + ' \n ' + i.description);
                }
            }
            return eventList; // return the embedded message
        } else {
            for(const i of events){
                if(!i.start.dateTime){      // if event only has a date
                    let startDate = new Date(i.start.date);
                    if(startDate.getTime() > maxDate.getTime()){    // filter the events to only show events up to a specified date
                        break;
                    }
                    eventList.addField(`**${i.summary}**`, `*${i.start.date}*` + ' \n ' + i.description);
                    continue;
                }
                // if event has a date and a time
                let startDate = new Date(i.start.dateTime);
                if(startDate.getTime() > maxDate.getTime()){        // filter the events to only show events up to a specified date
                    break;
                }
                let dateArr = i.start.dateTime.match(new RegExp("(.*?)T(.*?)-"));   // parse the date and time
                let formatTime = this.formatTime(dateArr[2]);   // prettify the time
                eventList.addField(`**${i.summary}**`, `*${dateArr[1]} ${formatTime.join(":")}*` + ' \n ' + i.description);
            }
            return eventList;
        }
    },
    // used to prettify the time, converted to 12 hour time format
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