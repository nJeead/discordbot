const {PREFIX} = require(`./config.json`);
const Discord = require(`discord.js`);
const {eventsMap} = require(`./eventObject`);
const gcal = require('./GCal');

module.exports = {
    name: "remove",
    aliases: ["rm", "delete"],
    description: "delete a event or a role and its calendar ***(role and calendar removal for ADMINS ONLY)***",
    syntax: `${PREFIX}rm [@role]` + "\n" +
            `${PREFIX}rm [calendarName] [eventName]`,
    async run(message, args) {
        if (message.mentions.roles && args.length <= 1) {
            if (!message.channel.permissionsFor(message.member).has("ADMINISTRATOR", false)) {
                message.channel.send("Sorry, This command is for Administrators only.");
                return;
            }

            // if (!message.mentions.roles) {
            //     message.channel.send("Please mention the role you want to delete");
            //     return;
            // }
            if(!gcal.gcalmap.get(message.mentions.roles.first().id)){
                message.channel.send("Role mentioned does not have a calendar associated with it. " +
                    "Do you still wish to delete it anyway? Reply with yes or no");
                const filter = m => m.content.includes("yes") || m.content.includes("no");
                const collector = message.channel.createMessageCollector(filter, {time: 15000});

                collector.on('collect', m => {
                    if (m.content === "yes") {
                        message.mentions.roles.forEach(role => {
                            let foundRole = message.guild.roles.cache.find(r => r === role);
                            if (foundRole) {
                                foundRole.delete().catch(reason => {message.channel.send("Missing permissions. Unable to remove role")});
                            }
                        });
                        message.react("👍");
                    }
                });

                collector.on('end', ms => {
                    console.log("Remove role only command complete");
                });
                return;
            }

            message.channel.send("Are you sure you want to delete the selected role(s) and calendar(s)? Deleting calendars " +
                "will also delete all events in that calendar. This can not be undone!" +
                " Send 'confirm' to confirm your request or 'cancel' to keep the role and calendar (15 sec timeout)");

            const filter = m => m.content.includes("confirm") || m.content.includes("cancel");
            const collector = message.channel.createMessageCollector(filter, {time: 15000});

            collector.on('collect', m => {
                if (m.content === "confirm") {
                    gcal.deleteCalendar(message.mentions.roles, message.channel);
                    message.mentions.roles.forEach(role => {
                        let foundRole = message.guild.roles.cache.find(r => r === role);
                        if (foundRole) {
                            foundRole.delete();
                        }
                    });
                    message.react("👍");
                }
            });

            collector.on('end', ms => {
                console.log("Remove command complete");
            });
        } else {
            let account = gcal.getAccount();
            let calName = args[0];
            let eventName = args[1];
            const calID = gcal.gcalmap.get(message.guild.roles.cache.find(role => role.name === calName).id);
            if(!calID){
                message.channel.send("Calendar does not exist. Please check available calendars and try again.")
                return;
            }
            const events = await gcal.getCalendarEvents(calID);
            let eventID;
            for(const i of events.data.items){
                if(i.summary === eventName){
                    eventID = i.id;
                }
            }
            if(!eventID){
                message.channel.send(`Event '${eventName}' does not exist in this calendar '${calName}'` +
                " Event names are _case sensitive_.");
                return;
            }
            await account.events.delete({
                calendarId: calID,
                eventId: eventID
            }).then((res, err) => {
                if(err){
                    message.channel.send("There was an error: " + err);
                    return;
                }
                message.react("👍");
            })
        }
    }
}