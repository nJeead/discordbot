const Discord = require('discord.js');
const {GCLIENTID, GCLIENTSECRET, GREFRESHTOKEN, RULES, PREFIX} = require('./config.json');
const {google} = require('googleapis');

module.exports = {
    getAccount() {
        const oAuth2Client = new google.auth.OAuth2(GCLIENTID, GCLIENTSECRET);
        oAuth2Client.setCredentials({
            refresh_token: GREFRESHTOKEN
        });
        return google.calendar({version: 'v3', auth: oAuth2Client});
    },

    async findCalendar(account, cal) {
        const res = await account.calendarList.list()
        let found = false;
        for (const i of res.data.items) {
            if (i.summary === cal) {
                found = true;
            }
        }
        return found;
    }
}

