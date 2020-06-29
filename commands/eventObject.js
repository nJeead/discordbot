const Discord = require('discord.js');
const cron = require('cron')
let eventsMap = new Map();

class Event{
    name = "";
    time = "";
    guestList = [];

    constructor(name, time, channel) {
        this.name = name;
        this.time = time;
        this._channel = channel;
    }

    addGuest(guests){
        this.guestList.push(guests);
        console.log(this.guestList);
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
            this._date = date;

            let reminder = new Discord.MessageEmbed()
                .setTitle("Reminder: " + this.name)
                .setDescription(this._date)
                .setColor("#00FFFF");

            let mentions = "";
            for(const i of this.guestList){
                mentions = mentions + i + "\n";
            }
            console.log(mentions);
            reminder.addField("Invites", mentions);


            let sm = new cron.CronJob(date, () => {
                this._channel.send(reminder);
                // this._channel.send(`Event Name: ${this.name} at time ${this.time}`);
                sm.stop();
            });
            this._task = sm;
            sm.start()

            eventsMap.set(this.name, this);
            console.log("Events in map: "+ Array.from(eventsMap.entries()));
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

module.exports = { name: "eventObject", Event }