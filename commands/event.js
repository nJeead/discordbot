const Discord = require('discord.js');
const {PREFIX, RULES} = require('./config.json');
// const {Event, eventsMap} = require('./eventObject');
const gcal = require('./GCal')

module.exports = {
    name: "event",
    aliases: ["ev", "e"],
    description: "create event for a Google Calendar",
    syntax:
        `${PREFIX}event name: [name], start: [date]-[time], cal: [class/role], ...\n` +
        `***Date*** ***format***: [MM/DD] or [Day(Mon, Tues, ...)]\n` +
        `***Time*** ***format***: [HH:mm] or [hh:mm:pm/am]\n` +
        `__**Optional parameters**__ (in any order):\n` +
        `***end***: [date]-[time]\n` +
        `***description***: [string without commas]\n` +
        `***location***: [string without commas]` +
        "```Examples: \n" + `${PREFIX}event name: Some Event, cal: Calendar Name, start: tomorrow-22:00\n` +
        `${PREFIX}event cal: A Calendar, name: Random Event, start: 1/15-4:00:pm, end: 1/16-4:00:pm, description: this is a description without commas, location: 123 UT Drive` +
        "```",

    // send formatted help message
    HelpMessage() {
        return new Discord.MessageEmbed()
            .setTitle("Command Options")
            .setColor("#00FFFF")
            .addField("Formatting Options: ", this.syntax);
    },

    // send formatted error message
    ErrorMessage(error) {
        return this.HelpMessage().setTitle("Error: " + error);
    },

    // parse and return answers to parameters
    getParam(args, param) {
        let regex = new RegExp(`${param}:( ?)(.*?)([,]|$)`, 'i');
        try {
            return args.match(regex)[2];
        } catch (e) {
            return null;
        }
    },

    async run(message, args) {
        const channel = message.channel;

        // gather all parameters
        const joined = args.join(" ");
        let name = this.getParam(joined, "name");
        let start = this.getParam(joined, "start");
        let end = this.getParam(joined, "end");
        let description = this.getParam(joined, "description");
        let location = this.getParam(joined, "location");
        let cal = this.getParam(joined, "cal");

        // send errors if missing required parameters
        if (!name && !start) {
            channel.send("'name: [eventName]' and 'start: [date]-[time]' missing. Please try again");
            return;
        }
        if (!name) {
            channel.send("'name: [eventName]' missing. Please try again");
            return;
        }
        if (!start) {
            channel.send("'start: [date]-[time]' missing. Please try again");
            return;
        }
        if (!cal) {
            channel.send("'cal: [calendar/role]' missing. Please try again");
            return;
        }

        // get calID from roleID
        let calID;
        try {
            calID = gcal.gcalmap.get(message.guild.roles.cache.find(role => role.name === cal).id);
        } catch (e) {
            message.channel.send("Role does not exist. Please check spelling and try again. _Role names are case sensitive_");
            return;
        }
        if (!calID) {
            channel.send(`Calendar for specified role does not exist. Please use '${PREFIX}request' to request a calendar for this role`)
            return;
        }

        let events = await gcal.getCalendarEvents(calID);
        for(const i of events.data.items){
            if(i.summary === name){
                message.channel.send("Event with same name already exists! Please choose another name or edit existing event.");
                return;
            }
        }

        // format start and end dates, if no end date is given, it will be the same as the start date
        let startDate = this.formatDate(start, channel);
        if(!startDate){
            message.channel.send("Error getting start date and time: \n" + `${PREFIX}event name: [name], start: [date]-[time], ..., @[class/role]` + "\n" +
                `***Date*** ***format***: [MM/DD] or [Day(Mon, Tues, ...)]` + "\n" +
                `***Time*** ***format***: [HH:mm] or [hh:mm:pm/am]` + "\n");
            return;
        }
        let endDate = this.formatDate(end, channel);
        if (!endDate) {
            message.channel.send(`No end date given, end date will be same as start date. Use '${PREFIX}edit' to change the end time`)
            endDate = new Date(startDate);
        }
        try {
            description += `\tCreator: ${message.author.tag}`
        } catch (e) {}

            // create event resource, to be sent to gAPI
        const event = {
            summary: name,
            start: {
                dateTime: startDate,
                timeZone: 'America/Chicago',
            },
            end: {
                dateTime: endDate,
                timeZone: 'America/Chicago',
            },
            description: description,
            location: location,
            reminders: {
                'useDefault': false,
                'overrides': [
                    {method: 'email', minutes: 24 * 60},
                    {method: 'popup', minutes: 10}
                ]
            }

        }

        // send to gAPI to add event
        await gcal.addEvent(calID, event, channel)

    },

    // format date from 12 hour time to Date() object
    formatDate(input, channel) {
        try {
            if (!input) return null;
            let splitStart = input.split('-');
            let date = splitStart[0].split('/');
            let month = "", day = "";
            let temp = getdate(date, channel);
            month = temp[0];
            day = temp[1];

            let time = splitStart[1].split(':');
            let hour = time[0];
            let min = time[1];
            try {
                if (((time[2] === "pm") || (time[2] === "PM")) && parseInt(hour) <= 12) {
                    hour = parseInt(hour) + 12;
                }
            } catch (e) {
            }

            let now = new Date();
            let eventdate = new Date(now.getFullYear(), (month - 1), day, hour, min);
            if (eventdate.toString() === "Invalid Date") {
                // channel.send("Invalid Date: " + `${PREFIX}event name: [name], start: [date]-[time], ..., @[class/role]` + "\n" +
                //     `***Date*** ***format***: [MM/DD] or [Day(Mon, Tues, ...)]` + "\n" +
                //     `***Time*** ***format***: [HH:mm] or [hh:mm:pm/am]` + "\n"
                // );
                return null;
            }
            return eventdate;
        } catch (e) {
            return null;
        }
    },
}
// parse day to get Date() object format
function getdate(date, channel) {
    let result = [];
    let month, day;
    if (date.length > 1) {
        month = date[0];
        day = date[1];
        // year = date[2];
        result[0] = month;
        result[1] = day;
    } else {
        let dayofweek = (day) => {
            let result;
            let d = day.toLowerCase();
            switch (d) {
                case "today":
                    result = new Date().getDay();
                    break;
                case "tomorrow":
                    let temp = new Date();
                    temp.setDate(temp.getDate() + 1);
                    result = temp.getDay();
                    break;
                case "sun":
                case "sunday":
                    result = 0;
                    break;
                case "mon":
                case "monday":
                    result = 1;
                    break;
                case "tues":
                case "tuesday":
                    result = 2;
                    break;
                case "wed":
                case "wednesday":
                    result = 3;
                    break;
                case "thurs":
                case "thur":
                case "thursday":
                    result = 4;
                    break;
                case "fri":
                case "friday":
                    result = 5;
                    break;
                case "sat":
                case "saturday":
                    result = 6;
                    break;
                default:
                    result = -1;
                    break;
            }
            return result;
        }
        let dayOfWeek = dayofweek(date[0]);
        if (dayOfWeek === -1) {
            // channel.send("Invalid day of the week: " +
            //     `***Date*** ***format***: [MM/DD] or [Day(Mon, Tues, ...)]`);
            return null;
        }

        let tempDate = new Date();
        while (tempDate.getDay() !== dayOfWeek) {
            tempDate.setDate(tempDate.getDate() + 1);
        }

        month = tempDate.getMonth() + 1;
        day = tempDate.getDate();

        result[0] = month;
        result[1] = day;
    }
    return result;
}