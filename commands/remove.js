const {PREFIX} = require(`./config.json`);
const Discord = require(`discord.js`);
const {eventsMap} = require(`./eventObject`);
const gcal = require('./GCal');

module.exports = {
    name: "remove",
    aliases: ["rm", "delete"],
    description: "delete a role and calendar ***(ADMIN ONLY)***",
    syntax: `${PREFIX}rm [@role]`,
    async run(message, args) {
        if (!message.channel.permissionsFor(message.member).has("ADMINISTRATOR", false)) {
            message.channel.send("Sorry, This command is for Administrators only.");
            return;
        }

        if(!message.mentions.roles){
            message.channel.send("Please mention the role you want to delete, along with its associated calendar");
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
            }
        });

        collector.on('end', ms => {
            console.log("Remove command complete");
        });
    }
}