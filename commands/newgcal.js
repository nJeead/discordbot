const {PREFIX} = require('./config.json');
const gcal = require('./GCal');

module.exports = {
    name: "newgcal",
    aliases: ["newcal", "newrole", "ncal"],
    description: "create a new Google calendar and role",
    syntax: `${PREFIX}newcal [calendar name] [role name] [description (optional)]` + "\n" +
            `Note: name can not have spaces, and if only one name is given, both role and calendar will have the same name`,
    async run(message, args) {
        const account = gcal.getAccount();

        if(!message.channel.permissionsFor(message.member).has("ADMINISTRATOR",false)){
            message.channel.send("Sorry, This command is for Administrators only.");
            return;
        }

        let calname = args[0];
        let rolename = args[1];
        let caldesc = args.join(' ');

        if(!calname){
            message.channel.send("Please enter: [calendar name] [role name]");
            return;
        }
        if(!rolename){
            rolename = calname;
        }

        if(message.guild.roles.cache.find(role => role.name === rolename)){
            message.channel.send("This role and calendar already exists!");
            return;
        }

        const newcal = {
            summary: calname,
            description: caldesc,
            timeZone: "America/Chicago"
        }

        if (!await gcal.findCalendar(account, calname)) {
            account.calendars.insert({
                resource: newcal,
            }).then(async res => {
                    let role = await message.guild.roles.create({
                        data: {
                            name: rolename,
                        }
                    });
                    const err = gcal.addtoGCalMap(role.id, await gcal.getCalID(account, calname));
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
    }
}