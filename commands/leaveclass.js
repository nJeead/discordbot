const {PREFIX} = require('./config.json');
const Discord = require('discord.js');

module.exports = {
    name: "leaveclass",
    aliases: ["leaverole", "leave"],
    description: "remove yourself from a class role",
    syntax: `${PREFIX}leaverole @{classRole} @{classRole} ...` +
        "```Example: " + `${PREFIX}leave @casuals @EE302 @EXISTINGROLE` + "```",

    run(message, args) {
        if (message.mentions.roles.size < 1) {
            message.reply(`Please mention the class(es) you want to leave`);
            return;
        }

        // removes mentioned roles from a user
        message.member.roles.remove(message.mentions.roles)
            .then(res => message.react("👍"),
                err => message.reply("Error: " + err));
    }
}