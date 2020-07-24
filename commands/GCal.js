/**
 * GCal.js
 * contains functions to work with the google calendar API and connect to database
 */

const Discord = require('discord.js');
const {RULES, PREFIX} = require('./config.json');
const {google} = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();

// initialize global variable 'gcalmap'
let gcalmap = new Map(); // contains key: roleID, val: calID

// connect to Heroku postgres database
const {Client: dbClient} = require('pg');
const db = new dbClient({
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: 5432,
    database: process.env.PGDATABASE,
    // connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const data_table = "calendarData";
db.connect()
    .then(() => console.log("Connection to database successful"))
    .catch(e => console.error("Connecting to Database ", e))
    .finally(() => {
        db.query(`CREATE TABLE IF NOT EXISTS ${data_table}(roleID TEXT, calID TEXT)`)   // create calendarData table if it doesnt exist
            .then(() => console.log("Table was created/already exists"))
            .then(()=>{
                db.query(`SELECT * FROM ${data_table}`)     // get all data from table and put into gcal map
                    .then(res => {
                        for(const i of res.rows){
                            gcalmap.set(i.roleid, i.calendarid);
                        }
                        console.log("On startup: ")
                        console.log(gcalmap);
                        // db.query(`DELETE FROM ${data_table}`)   // delete everything from data table
                    })
                    .catch(err => console.error("Getting data from table ",err));
            })
            .catch(err => console.error("Creating table ",err));
    })

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
        db.query(`INSERT INTO ${data_table}(roleid, calendarid) VALUES ('${roleID}', '${calID}')`)
            .then(() => console.log(`Added set to db: [${roleID}, ${calID}]`))
            .catch(err => console.error("Adding to db", err));
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
                db.query(`DELETE FROM ${data_table} WHERE roleid = '${role.id}'`)
                    .then(() => console.log(`Deleted set from db: [${role.id}, ${calID}]`))
                    .catch(err => console.error("Deleting from db", err));

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

