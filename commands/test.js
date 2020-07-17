const fs = require('fs');
const {GCLIENTID, GCLIENTSECRET, GREFRESHTOKEN, RULES, PREFIX} = require('./config.json');
const Discord = require('discord.js');
const {google} = require('googleapis');
const gcal = require('./GCal');
let temp = require('../gcaldata.json')

module.exports = {
    name: "test",
    aliases: [""],
    description: "only for development process",
    async run(message, args){
        // message.mentions.roles.forEach(role => {
        //     let foundRole = message.guild.roles.cache.find(r => r === role);
        //     if(foundRole){
        //         foundRole.delete();
        //     }
        // })
        // message.channel.send("SUCCESS")

        // let map = new Map();
        // map.set("K1", "V1");
        // map.set("K2", "V2");
        // map.set("K3", "V3");
        //
        // let mapArr = [];
        // for(const [k,v] of map){
        //     mapArr.push([k,v]);
        // }
        // await fs.writeFile("./gcaldata.json", JSON.stringify(mapArr), (err => {return err}))
        //
        // let m = new Map(temp);
        // console.log(m);


        // let temp = message.guild.roles.cache.find(role => role.name === "casual");
        // console.log(temp.name);
        // let temp = args.join(" ");
        // console.log(temp);
        //
        // let nameRegex = new RegExp('name: (.*?), ');
        // let timeRegex = new RegExp('start: (.*?),');
        // console.log(temp.match(nameRegex)[1]);
        // console.log(temp.match(timeRegex)[1]);

        // const oAuth2Client = new google.auth.OAuth2(GCLIENTID, GCLIENTSECRET);
        // oAuth2Client.setCredentials({
        //     refresh_token: GREFRESHTOKEN
        // });
        //
        // const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
        // let startTime = new Date();
        // let endTime = new Date();
        // endTime.setHours(endTime.getHours() + 2);

        // share calendar example
        // const req = {
        //     calendarId: 'primary',
        //     resource: {
        //         role: "reader",
        //         scope: {
        //             type: 'user',
        //             value: 'venom403@gmail.com'
        //         }
        //     }
        // }
        // calendar.acl.insert(req)
        //     .then(res => {
        //         console.log("Success" + res);
        //     },
        //     err => {
        //         console.error("Error", err);
        //     }
        //     )

        // create event example
        // const event = {
        //     summary: "TestEvent",
        //     start: {
        //         dateTime: startTime,
        //         timeZone: 'America/Chicago',
        //     },
        //     end: {
        //         dateTime: endTime,
        //         timeZone: 'America/Chicago',
        //     },
        // }
        //
        // calendar.events.insert({calendarId: "primary", resource: event},
        //     err => {
        //         if(err) return console.error("Error Creating Event...", err);
        //         return console.log(`Event successfully created`);
        // });




        // create calendar example
        // const classcalendar = {
        //     summary: "RandomSummary",
        //     calendarId: "RandomClass Calendar",
        //     timeZone: "America/Denver"
        // }
        //
        // calendar.calendars.insert({
        //     resource: classcalendar,
        // }).then(res => {console.log("Success")},
        //         err => console.error("Error\n", err));




        // get calendar info example
        // calendar.calendars.get({calendarId:"primary"})
        //     .then((res) => {console.log(res.data)},
        //         (err) => {console.error("Error:", err)})

    }
}
