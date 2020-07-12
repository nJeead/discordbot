const Discord = require('discord.js');
const { PREFIX, RULES } = require('./config.json');
const {Event, eventsMap} = require('./eventObject');

module.exports = {
    name: "event",
    aliases: [""],
    description: "create event in GCalendar",
    syntax: `${PREFIX}event [name] [MM/DD] [HH:mm] [@guest1 @guest2 ...]` + "\n" +
        `${PREFIX}event [name] [MM/DD] [hh:mm:pm/am] [@guest1 @guest2 ...]` + "\n" +
        `${PREFIX}event [name] [Day (Mon, Tues, ...)] [HH:mm] [@guest1 @guest2 ...]` + "\n" +
        `${PREFIX}event [name] [Day (Mon, Tues, ...)] [hh:mm:pm/am] [@guest1 @guest2 ...]` + "\n",

    HelpMessage() {
        // let i = 1;
        // for(const s of this.syntax){
        //     syntaxEmbed.addField(`Option ${i}` , s);
        //     i++;
        // }
        return new Discord.MessageEmbed()
            .setTitle("Command Options")
            .setColor("#00FFFF")
            .addField("Formatting Options: ", this.syntax);
    },

    ErrorMessage(error) {
        return this.HelpMessage().setTitle("Error: " + error);
    },

    run(message, args) {
        const channel = message.channel;

        if (args.length < 3) {
            channel.send(this.ErrorMessage("Not Enough Arguments"));
            return;
        }

        let name = args[0];
        if (eventsMap.get(name)) {
            channel.send(this.ErrorMessage("Event Already Exists"));
            return;
        }

        let date = args[1].split('/');
        let month, day = "";
        let temp = this.getdate(date, channel);
        month = temp[0];
        day = temp[1];

        let time = args[2].split(':');
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
        if(eventdate.toString() === "Invalid Date"){
            channel.send(this.ErrorMessage("Invalid Date"));
            return;
        }
        let event = new Event(name, time, channel);

        event.addGuest(Array.from(message.mentions.users.values()));
        event.addGuest(Array.from(message.mentions.roles.values()));

        if (event.scheduleEvent(eventdate)) {
            channel.send(`${name} successfully scheduled at ${eventdate}`);
            // channel.send(`${name} is scheduled at ${eventdate} with ${event.guestList}`);
        }
    },
    getdate(date, channel){
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
                channel.send(this.ErrorMessage("Invalid day of the week"));
                return;
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
    },
}