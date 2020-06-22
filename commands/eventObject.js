// const Discord = require('discord.js');
const cron = require('cron');

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
        this._date = date;
        let sm = new cron.CronJob(date, () => {
            this._channel.send(`Event Name: ${this.name} at time ${this.time}`);
            console.log("Scheduled message");
            sm.stop();
        });
        this._task = sm;
        sm.start()
        console.log("formatted date: "+ date);
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