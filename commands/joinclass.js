const {PREFIX} = require('./config.json');
const Discord = require('discord.js');

module.exports = {
    name: "joinclass",
    aliases: ["join"],
    description: "",
    syntax: `${PREFIX}joinclass @{classRole} @{classRole} ...`,

    run(message, args) {
        if(message.mentions.roles.size<1){
            message.reply(`Please mention the class(es) you want to join or use ${PREFIX}request to request a class`);
            return;
        }
        message.guild.members.cache.get(message.author.id).roles.add(message.mentions.roles);
        message.reply("done");
    }
}