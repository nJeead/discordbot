const Discord = require('discord.js');
const { PREFIX, RULES } = require('./config.json');
const {Event} = require('./eventObject');

module.exports = {
    name: "event",
    description: "create a new event to invite people to",
    syntax: [
            `${PREFIX}event <name> <MM/DD> <HH:mm> <@guest1 @guest2 ...>`,
            `${PREFIX}event <name> <MM/DD> <hh:mm:pm/am> <@guest1 @guest2 ...>`,
            `${PREFIX}event <name> <Day (Mon, Tues, ...)> <HH:mm> <@guest1 @guest2 ...>`,
            `${PREFIX}event <name> <Day (Mon, Tues, ...)> <hh:mm:pm/am> <@guest1 @guest2 ...>`,
            ],

    HelpMessage(){
        const syntaxEmbed = new Discord.MessageEmbed()
            .setTitle("Command Options")
            .setColor("#00FFFF")
        for(const s of this.syntax){
            let i = 1;
            syntaxEmbed.addField(`Option ${i}` , s);
            i++;
        }
    },

    ErrorMessage(error){
        return this.HelpMessage().setTitle("Error: " + error);
    },

    run(message, args){
        const channel = message.channel;

        if(args.length < 3){
            channel.send(this.ErrorMessage("Not Enough Arguments"));
            return;
        }

        let name = args[0];
        let date = args[1].split('/');
        let time = args[2].split(':');
        let month, day, year, ampm = "";

        if(date.length > 1){
            month = date[0];
            day = date[1];
            // year = date[2];
        } else {
            let dayofweek = getday(date[0]);
            if (dayofweek === -1) {
                channel.send(this.ErrorMessage("Invalid day of the week"));
                return;
            }

            let tempDate = new Date();
            while (tempDate.getDay() !== dayofweek){
                tempDate.setDate(tempDate.getDate() + 1);
            }

            month = tempDate.getMonth()+1;
            day = tempDate.getDate();
        }

        let hour = time[0];
        let min = time[1];
        try{
            if(((time[2] === "pm") || (time[2] === "PM")) && parseInt(hour) <= 12){
                hour = parseInt(hour) + 12;
            }
        } catch (e) {}


        let now = new Date();
        let eventdate = new Date(now.getFullYear(), (month-1), day, hour, min);
        // let eventdate = new Date(now.getFullYear(), (date[0]-1), date[1], time[0], time[1]);

        let event = new Event(name, time, channel);
        // let cronFormat = time[1] + " "+ time[0] + " " + date[1]  + " "+ (date[0]-1) + " " + eventdate.getDay();


        if(event.scheduleEvent(eventdate)){
            channel.send(`${name} is scheduled at ${eventdate} with {mentions}`);
        }
    }
}

function getday(day){
    let result = 0;
    switch (day) {
        case "Today":
        case "today":
            result = new Date().getDay();
            break;
        case "Sun":
        case "sun":
        case "Sunday":
        case "sunday":
            result = 0;
            break;
        case "Mon":
        case "mon":
        case "Monday":
        case "monday":
            result = 1;
            break;
        case "Tues":
        case "tues":
        case "Tuesday":
        case "tuesday":
            result = 2;
            break;
        case "Wed":
        case "wed":
        case "Wednesday":
        case "wednesday":
            result = 3;
            break;
        case "Thurs":
        case "thurs":
        case "Thur":
        case "Thursday":
        case "thursday":
            result = 4;
            break;
        case "Fri":
        case "fri":
        case "Friday":
        case "friday":
            result = 5;
            break;
        case "Sat":
        case "sat":
        case "Saturday":
        case "saturday":
            result = 6;
            break;
        default:
            result = -1;
            break;
    }
    return result;
}