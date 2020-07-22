/**
 * GCal.js
 * contains functions to work with the google calendar API
 */

const fs = require('fs');
const Discord = require('discord.js');
const {GCLIENTID, GCLIENTSECRET, GREFRESHTOKEN, RULES, PREFIX} = require('./config.json');
const {google} = require('googleapis');

// initialize global variable 'gcalmap'
let gcaldata = require('../gcaldata.json');
let gcalmap; // contains key: roleID, val: calID
if (gcaldata) { // if json file is empty, create an empty map
    gcalmap = new Map(gcaldata);
} else {
    gcalmap = new Map();
}

module.exports = {
    gcalmap, // key: roleID, val: calID
    // authenticate with OAuth2 and get google calendar account details
    getAccount() {
        // const oAuth2Client = new google.auth.OAuth2(GCLIENTID, GCLIENTSECRET);
        // oAuth2Client.setCredentials({
        //     refresh_token: GREFRESHTOKEN
        // });

        const oAuth2Client = new google.auth.OAuth2(process.env.GCLIENTID, process.env.GCLIENTSECRET);
        oAuth2Client.setCredentials({
            refresh_token: process.env.GREFRESHTOKEN
        });
        return google.calendar({version: 'v3', auth: oAuth2Client});
    },

    /**
     * check if calendar exists already
     * @param account, authenticated account details
     * @param cal, calendar name
     * @returns true if a calendar exists, false otherwise
     */
    async findCalendar(account, cal) {
        const res = await account.calendarList.list(); // wait to recieve calendarlist
        // compare calendar names
        for (const i of res.data.items) {
            if (i.summary === cal) {
                return true;
            }
        }
        return false;
    },
    /**
     *  Get the ID of a calendar
     * @param account, authenticated account details
     * @param calname, calendar name
     * @returns ID of requested calendar
     */
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
    /**
     * Share a calendar with an email
     * @param calname, calendar name
     * @param email, email to be added to ACL
     * @returns returns 'done' or 'error'
     */
    async newSubscription(calID, email) {
        const account = this.getAccount();
        const req = {
            calendarId: calID,
            resource: {
                role: "reader", // read only permission
                scope: {
                    type: 'user',
                    value: email
                }
            }
        }
        return await account.acl.insert(req);
    },
    /**
     * Add a calendar to a specified calendar
     * @param calID, calendar ID
     * @param event, event resource
     * @param channel, discord channel to send error message
     * @returns error or done promise from discordAPI
     */
    async addEvent(calID, event, channel) {
        const account = this.getAccount();
        await account.events.insert({calendarId: calID, resource: event},
            err => {
                if (err) return channel.send("Error Creating Event...", err);
                return channel.send(`Event successfully created`);
            });
    },
    // returns list of all calendars
    async getCalendarList() {
        const account = this.getAccount();
        return await account.calendarList.list()
    },
    /**
     * Add a role, calendar set to gcalmap, then update the gcalmap.json with new data
     * @param roleID
     * @param calID
     */
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
    /**
     * deletes all roles and associated calendars from google calendar
     * @param roles, list of roles to be deleted
     * @param channel, channel for error messages
     * @returns {Promise<void>}
     */
    async deleteCalendar(roles, channel) {
        const account = this.getAccount();
        roles.forEach(role => {
            let calID = gcalmap.get(role.id);
            account.calendarList.delete({
                calendarId: calID
            }).then((res, err) => {
                if (err) console.error("Error deleting calendar",err);
                channel.send("Role(s) and calendar(s) removed"); // send confirmation
                gcalmap.delete(role.id); // delete role from map
                // convert map to array
                let mapArr = [];
                for (const [k, v] of gcalmap) {
                    mapArr.push([k, v]);
                }
                // update json file
                fs.writeFile("./gcaldata.json", JSON.stringify(mapArr), (err => {
                    return err;
                }));
            })
        })
    },

    // return list of calendar events in order of startTime
    async getCalendarEvents(calID) {
        const account = this.getAccount();
        return await account.events.list({
            calendarId: calID,
            orderBy: "startTime",
            singleEvents: true
        })
    },
}

