const Discord = require('discord.js');
const {GCLIENTID, GCLIENTSECRET, GREFRESHTOKEN, RULES, PREFIX} = require('./config.json');
const {google} = require('googleapis');

let gcalmap = new Map();

module.exports = {
    gcalmap,
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

    async getCalID(account, calname){
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

    async newSubscription(calname, email){
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
    }
}

