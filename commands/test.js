const Discord = require('discord.js');
const { RULES } = require('./config.json');

module.exports = {
    name: "test",
    description: "only for development process",
    run(message, args){
        channel = message.channel;
        const embed = new Discord.MessageEmbed()
            .setColor('#00FFFF')
            .setTitle('Rules')
            .addField('Rules', RULES)
        channel.send(embed);
    }
}