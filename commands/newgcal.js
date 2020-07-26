const {PREFIX} = require('./config.json');
const gcal = require('./GCal');

module.exports = {
    name: "newgcal",
    aliases: ["newcal", "newrole", "cal"],
    description: "create a new Google calendar and role (ADMIN ONLY)",
    syntax: `${PREFIX}newcal cal: [calendar name], role: [role name (optional)], description: [description (optional)]` + "\n" +
            `Note: both role and calendar will have the same name if role name is not specified`+
            "```Example: " + `${PREFIX}newcal cal: CalendarName, description: some random description for the calendar` + "```",
    async run(message, args) {
        const account = gcal.getAccount();

        if(!message.channel.permissionsFor(message.member).has("ADMINISTRATOR",false)){
            message.channel.send("Sorry, This command is for Administrators only.");
            return;
        }
        let joined = args.join(" ");
        let calname = this.getParam(joined, "cal");
        let rolename = this.getParam(joined, "role");
        let caldesc = this.getParam(joined, "description");

        // send error if parameters not given
        if(!calname){
            message.channel.send("Please enter: [calendar name] [role name]");
            return;
        }
        if(!rolename){
            rolename = calname;
        }

        // check if a role exists already
        if(message.guild.roles.cache.find(role => role.name === rolename)){
            message.channel.send("This role and calendar already exists!");
            return;
        }

        // prepare calendar resource for gAPI
        const newcal = {
            summary: calname,
            description: caldesc,
            timeZone: "America/Chicago"
        }

        // wait for API to respond with a success for fail
        if (!await gcal.findCalendar(account, calname)) { // if the calendar doesnt already exist, continue
            account.calendars.insert({ // add new calendar to account
                resource: newcal,
            }).then(async res => {
                    let role = await message.guild.roles.create({ // create new role in association with that calendar
                        data: {
                            name: rolename,
                        }
                    });
                    const err = gcal.addtoGCalMap(role.id, await gcal.getCalID(account, calname)); // update map to add new role and calendar
                    if(err){
                        message.channel.send("Error saving calendar data: " + err);
                        return;
                    }
                    await message.react("👍");
                },
                err => {
                    message.channel.send("Error creating calendar: " + err);
                    console.error("Error\n", err)
                });
        } else {
            message.channel.send("Calendar already exists");
        }
    },
    getParam(args, param) {
        let regex = new RegExp(`${param}:( ?)(.*?)([,]|$)`, 'i');
        try {
            return args.match(regex)[2];
        } catch (e) {
            return null;
        }
    },

}