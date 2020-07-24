const {PREFIX} = require('./config.json');
const Discord = require('discord.js');

module.exports = {
    name: "joinclass",
    aliases: ["joinrole", "join"],
    description: "join a class role",
    syntax: `${PREFIX}joinclass @{classRole} @{classRole} ...` +
            "```Example: " + `${PREFIX}joinclass @casuals @EE302 @EXISTINGROLE` + "```",

    run(message, args) {
        if(message.mentions.roles.size<1){
            message.reply(`Please mention the class(es) you want to join or use ${PREFIX}request to request a class`);
            return;
        }

        // adds mentioned roles to a user
        message.guild.members.cache.get(message.author.id).roles.add(message.mentions.roles)
            .then(res => message.react("👍"),
                    err => message.reply("Nice try, but you don't have permission :) Try again with the correct role(s)"));
    }
}