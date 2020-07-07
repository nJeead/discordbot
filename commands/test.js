const Discord = require('discord.js');
const { RULES } = require('./config.json');
const cron = require('cron');

module.exports = {
    name: "test",
    aliases: [""],
    description: "only for development process",
    run(message, args){
        let users = [];
        message.channel.send(`message author: ${message.author}`);
        // for(const i of message.mentions.users.values()){
        //     // users.push("<@" + i.id + ">");
        //     message.channel.send(`<${i.id}>`);
        //     message.channel.send(`<@${i.id}>`);
        //     message.channel.send(`<@!${i.id}>`);
        //     message.channel.send(`<!${i.id}>`);
        // }
        message.channel.send(`${message.author}`);
        // message.channel.send(new Discord.MessageEmbed().addField("All mentions: ", users));
    }
}