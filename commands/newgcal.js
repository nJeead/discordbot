const {PREFIX} = require('./config.json');
const gcal = require('./GCal');

module.exports = {
    name: "newgcal",
    aliases: ["newcal"],
    description: "create a new Google calendar",
    syntax: `${PREFIX}newcal [name] [role association] [description (optional)]`,
    async run(message, args) {
        const account = gcal.getAccount();

        let calname = args[0];
        let caldesc = args.join(' ');
        if (!calname) {
            message.channel.send("Please enter calendar name!");
            return;
        }
        if(!message.mentions.roles.first()){
            message.channel.send("Please mention role associated with this calendar!");
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
            }).then(res => {
                    message.react("👍");
                },
                err => {
                    message.channel.send("Something went wrong: " + err);
                    console.error("Error\n", err)
                });
            gcal.gcalmap.set(message.mentions.roles.first(), calname);
        } else {
            message.channel.send("Calendar already exists");
        }
    }
}