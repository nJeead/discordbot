const fs = require('fs');
const Discord = require('discord.js');
const {GCLIENTID, GCLIENTSECRET, GREFRESHTOKEN, RULES, PREFIX} = require('./config.json');
const {google} = require('googleapis');

let gcalmap; // key: roleID, val: calID

module.exports = {
    gcalmap,
    initgcalmap() {
        let gcaldata = require('../gcaldata.json');
        if (gcaldata) {
            gcalmap = new Map(gcaldata);
        }
    },
    getAccount() {
        const oAuth2Client = new google.auth.OAuth2(GCLIENTID, GCLIENTSECRET);
        oAuth2Client.setCredentials({
            refresh_token: GREFRESHTOKEN
        });
        return google.calendar({version: 'v3', auth: oAuth2Client});
    },

    async findCalendar(account, cal) {
        const res = await account.calendarList.list()
        for (const i of res.data.items) {
            if (i.summary === cal) {
                return true;
            }
        }
        return false;
    },

    async getCalID(account, calname) {
        const res = await account.calendarList.list()
        let ID = "";
        for (const i of res.data.items) {
            if (i.summary === calname) {
                ID = i.id;
                return ID;
            }
        }
        return ID;
    },

    async newSubscription(calname, email) {
        const account = this.getAccount();
        const req = {
            calendarId: await this.getCalID(account, calname),
            resource: {
                role: "reader",
                scope: {
                    type: 'user',
                    value: email
                }
            }
        }
        account.acl.insert(req)
            .then(res => {
                    return "done";
                },
                err => {
                    console.error("subscription error: ", err)
                    return "error";
                }
            )
    },
    async addEvent(calID, event, channel) {
        const account = this.getAccount();
        await account.events.insert({calendarId: calID, resource: event},
            err => {
                if (err) return channel.send("Error Creating Event...", err);
                return channel.send(`Event successfully created`);
            });
    },
    async getCalendarList(channel) {
        const account = this.getAccount();
        return await account.calendarList.list()
    },
    addtoGCalMap(roleID, calID) {
        gcalmap.set(roleID, calID);
        let mapArr = [];
        for (const [k, v] of gcalmap) {
            mapArr.push([k, v]);
        }
        fs.writeFile("./gcaldata.json", JSON.stringify(mapArr), (err => {
            return err
        }));
    },
    async deleteCalendar(roles, channel) {
        const account = this.getAccount();
        roles.forEach(role => {
            let calID = gcalmap.get(role.id);
            account.calendarList.delete({
                calendarId: calID
            }).then((res, err) => {
                if (err) throw err;
                channel.send("Role(s) and calendar(s) removed");
                gcalmap.delete(role.id);
                let mapArr = [];
                for (const [k, v] of gcalmap) {
                    mapArr.push([k, v]);
                }
                fs.writeFile("./gcaldata.json", JSON.stringify(mapArr), (err => {
                    return err;
                }));
            })
        })
    }
}

