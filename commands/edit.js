const {PREFIX} = require(`./config.json`);
const Discord = require(`discord.js`);
const {eventsMap} = require(`./eventObject`);
const {getdate} = require('./event');

module.exports ={
    name: "edit",
    description: "change an existing event's properties",
    syntax: `${PREFIX}edit [eventName] [property to change] [change]` + "\n"+
            "Properties: date, time, name, add, remove, end\n" +
            "Note: add and remove command used for user mentions\n" +
            "Date and Time formatting same as EVENT command",

    ErrorMessage(error){
        // let i = 1;
        // for(const s of this.syntax){
        //     syntaxEmbed.addField(`Option ${i}` , s);
        //     i++;
        // }
        return new Discord.MessageEmbed()
            .setTitle("Error: " + error)
            .setColor("#00FFFF")
            .addField("Formatting Options: ", this.syntax);
    },

    run(message, args) {
        // console.log(args);
        let channel = message.channel;
        let event = null;
        let eventName = args[0];
        if(eventsMap.get(eventName)){
            event = eventsMap.get(eventName);
        } else{
            channel.send("Event does not exist!");
            return;
        }
        if (args.length < 2) {
            message.channel.send(this.ErrorMessage("not enough arguments"));
            return;
        }
        let prop = args[1].toLowerCase();
        switch (prop) {
            case "name":
                let newName = args[2];
                eventsMap.delete(eventName);
                eventsMap.set(newName, event);
                channel.send(`${eventName} changed to ${newName}`);
                break;
            case "date":
                let date = args[2].split('/');
                let month, day;

                let temp = getdate(date);
                month = temp[0];
                day = temp[1];

                event._task.stop();
                event.date.setDate(day);
                event.date.setMonth(month - 1);

                event.rescheduleEvent(event.date);
                channel.send(`Date changed to ${event._task.nextDate()}`);
                break;
            case "time":
                let time = args[2].split(':');
                let hour = time[0];
                let min = time[1];
                try {
                    if (((time[2] === "pm") || (time[2] === "PM")) && parseInt(hour) <= 12) {
                        hour = parseInt(hour) + 12;
                    }
                } catch (e) {
                }

                event._task.stop();
                event.date.setHours(hour);
                event.date.setMinutes(min);

                event.rescheduleEvent(event.date);
                channel.send(`Time changed to ${event._task.nextDate()}`);
                break;
            case "add":
                let addmentions = Array.from(message.mentions.users.values());
                addmentions.push(Array.from(message.mentions.roles.values()));
                if(addmentions.length <= 1){
                    channel.send("Please mention users you want to add");
                    return;
                }
                event.addGuest(addmentions);
                let listString = "";
                for(const i of event.guestList){
                    listString = listString + i.toString();
                }
                channel.send(new Discord.MessageEmbed().setTitle("Success")
                    .addField("Current Invite List", listString));
                break;
            case "remove":
                let notfound = [];
                let found = [];
                let mentions = Array.from(message.mentions.users.values());
                mentions.push(Array.from(message.mentions.roles.values()));

                if(mentions.length <= 1){
                    channel.send("Please mention users you want to remove");
                    return;
                }

                for(const i of mentions){
                    let index = event.guestList.indexOf(i);
                    if(index !== -1){
                        event.guestList.splice(index, 1);
                        found.push(i);
                    } else {
                        notfound.push(i);
                    }
                }

                let msg = new Discord.MessageEmbed();
                msg.setTitle(eventName);
                if(notfound.length > 0){
                    try{
                        msg.addField("Unable to remove (Not Invited)", notfound);
                    } catch (e) {
                    }
                }
                if(found.length > 0){
                    try{
                        msg.addField("Successfully Removed", found);
                    } catch (e) {
                    }
                }
                channel.send(msg);
                channel.send(`new list: ${event.guestList}`);
                break;
            case "end":
                event._task.stop();
                channel.send(`${eventName} has been canceled`);
                break;
            default:
                channel.send(this.ErrorMessage("Invalid Property"));
                break;
        }
    }
}