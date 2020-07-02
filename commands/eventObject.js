const Discord = require('discord.js');
const cron = require('cron')
let eventsMap = new Map();

class Event{
    name = "";
    time = "";
    guestList = [];
    date = new Date();

    constructor(name, time, channel) {
        this.name = name;
        this.time = time;
        this._channel = channel;
    }

    addGuest(guests){
        if(guests.length !== 0){

        }
        // console.log(this.guestList);
    }

    get guestList(){
        return this.guestList;
    }

    // * * * * * *
    // | | | | | |
    // | | | | | day of week
    // | | | | month
    // | | | day of month
    // | | hour
    // | minute
    // seconds (optional)

    scheduleEvent(date){
        // try{
            this.date = date;

            let reminder = new Discord.MessageEmbed()
                .setTitle("Reminder: " + this.name)
                .setDescription(this.date)
                .setColor("#00FFFF");

            let mentions = "";
            if(this.guestList.length === 0){
                mentions = "None";
            } else {
                for(const i of this.guestList){
                    mentions = mentions + i + "\n";
                }
            }
            // console.log(mentions);
            reminder.addField("Invites", mentions);


            let sm = new cron.CronJob(date, () => {
                this._channel.send(reminder);
                eventsMap.delete(this.name);
                // this._channel.send(`Event Name: ${this.name} at time ${this.time}`);
                sm.stop();
            });
            this._task = sm;
            try {
                sm.start()
            } catch (e) {
                this._channel.send("Date and time is in the past");
            }
            eventsMap.set(this.name, this);
            // console.log("Events in map: "+ Array.from(eventsMap.entries()));
            return true;
        // } catch (e) {
        //     this._channel.send("Error: Date and Time is in the past!");
        //     return false;
        // }

    }

    rescheduleEvent(date){
        this._task.stop();
        this.scheduleEvent(date);
    }

    get name(){
        return this.name;
    }

    set name(n){
        this.name = n;
    }
}

module.exports = { name: "eventObject", Event, eventsMap }