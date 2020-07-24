const {PREFIX} = require(`./config.json`);
const Discord = require(`discord.js`);
const gcal = require('./GCal');

module.exports = {
    name: "remove",
    aliases: ["rm", "delete"],
    description: "delete a event or a role and its calendar (role and calendar removal for ADMINS ONLY)",
    syntax: `${PREFIX}rm [@role]` + "\n" +
            `${PREFIX}rm [calendarName] [eventName]`,
    async run(message, args) {
        if (message.mentions.roles.size !== 0 && args.length >= 1) {   // this block is used to remove a calendar and a role
            // check for ADMIN permissions
            if (!message.channel.permissionsFor(message.member).has("ADMINISTRATOR", false)) {
                message.channel.send("Sorry, This command is for Administrators only.");
                return;
            }
            if(!message.mentions.roles){
                message.channel.send("Please mention the role(s) and calendar(s) you want to delete");
                return;
            }

            let rolesWCal = new Map();
            let rolesNoCal = new Map();
            message.mentions.roles.forEach(role => {
                if(gcal.gcalmap.get(role.id)){
                    rolesWCal.set(role.id, role);
                } else {
                    rolesNoCal.set(role.id, role);
                }
            });

            // if a mentioned role does not have a calendar associated with it, the sender can decide to still delete the role
            if(rolesNoCal.size > 0 && rolesWCal.size === 0){
                message.channel.send("Role(s) mentioned does not have a calendar associated with it. " +
                    "Do you still wish to delete them anyway? Reply with 'yes' or 'no'");

                // create message collector with the filter for 'yes' or 'no' with a 15 sec timeout
                const filter = m => m.content.includes("yes") || m.content.includes("no");
                const collector = message.channel.createMessageCollector(filter, {time: 15000});

                // when author sends 'yes', the role will be deleted from the server
                collector.on('collect', m => {
                    if (m.content === "yes") {
                        message.mentions.roles.forEach(role => {
                            let foundRole = message.guild.roles.cache.find(r => r === role);
                            if (foundRole) {
                                // .catch() sends message if author tries removal of role without the proper permissions
                                foundRole.delete().catch(reason => {message.channel.send("Missing permissions. Unable to remove role")});
                            }
                        });
                        message.react("👍");
                    }
                });

                // after collector times out
                collector.on('end', ms => {
                    console.log("Remove role only command complete");
                });

            } else if (rolesWCal.size > 0 && rolesNoCal.size > 0){ // mix of roles with and without calendars
                message.channel.send("Some role(s) mentioned have a calendar associated with it and some roles do not. " +
                    "This will delete all calendars, events, and roles mentioned. Do you still wish to delete them anyway? Reply with 'confirm' or 'cancel'");

                // create message collector with the filter for 'yes' or 'no' with a 15 sec timeout
                const filter = m => m.content.includes("confirm") || m.content.includes("cancel");
                const collector = message.channel.createMessageCollector(filter, {time: 15000});

                // when author sends 'yes', the role will be deleted from the server
                collector.on('collect', m => {
                    if (m.content === "confirm") {
                        gcal.deleteCalendar(rolesWCal, message.channel);
                        message.mentions.roles.forEach(role => {
                            let foundRole = message.guild.roles.cache.find(r => r === role);
                            if (foundRole) {
                                // .catch() sends message if author tries removal of role without the proper permissions
                                foundRole.delete().catch(reason => {message.channel.send("Missing permissions. Unable to remove role")});
                            }
                        });
                        message.react("👍");
                    }
                });

                // after collector times out
                collector.on('end', ms => {
                    console.log("Remove mixed role command complete");
                });

            } else {
                // if the calendar does exist:
                message.channel.send("Are you sure you want to delete the selected role(s) and calendar(s)? Deleting calendars " +
                    "will also delete all events in that calendar. This can not be undone!" +
                    " Send 'confirm' to confirm your request or 'cancel' to keep the role and calendar (15 sec timeout)");

                // create message collector to confirm or cancel the request
                const filter = m => m.content.includes("confirm") || m.content.includes("cancel");
                const collector = message.channel.createMessageCollector(filter, {time: 15000});

                // if author confirms, then calendar is deleted from gcaldate.json, the google calendar, and the role is removed
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
            }

        } else {        // else, this block is used to remove an event from a calendar
            let account = gcal.getAccount();
            let calName = args[0];
            let eventName = args[1];
            if(!eventName || !calName){
                message.channel.send(`Missing parameters. Format is: '${PREFIX}rm [calendarName] [eventName]'`);
                return;
            }
            // get calendarID through the roleID
            const role = message.guild.roles.cache.find(role => role.name === calName);
            if(!role){
                message.channel.send("Role and calendar do not exist. Please check available calendars and try again.")
                return;
            }

            const calID = gcal.gcalmap.get(role.id);

            if(!calID){
                message.channel.send("Calendar does not exist for this role. Please check available calendars and try again.")
                return;
            }

            const events = await gcal.getCalendarEvents(calID); // wait for gAPI to send events for a specific calendar

            // get EventID, needed for event.delete()
            let eventID;
            for(const i of events.data.items){
                if(i.summary === eventName){
                    eventID = i.id;
                    break;
                }
            }
            if(!eventID){
                message.channel.send(`Event '${eventName}' does not exist in this calendar '${calName}'` +
                " Event names are _case sensitive_.");
                return;
            }

            // send request to remove the event, react is successful, send error otherwise
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