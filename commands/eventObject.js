// const Discord = require('discord.js');
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
        try{
            this._date = date;
            let sm = new cron.CronJob(date, () => {
                this._channel.send(`Event Name: ${this.name} at time ${this.time}`);
                console.log("Scheduled message");
                sm.stop();
            });
            this._task = sm;
            sm.start()

            eventsMap.set(this.name, this);
            console.log("Events in map: "+ eventsMap);
            return true;
        } catch (e) {
            this._channel.send("Error: Date and Time is in the past!");
            return false;
        }

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

module.exports = { Event }