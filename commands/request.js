const {PREFIX} = require('./config.json');
const Discord = require('discord.js');

module.exports = {
    name: "request",
    aliases: ["requestclass"],
    description: "",
    syntax: `${PREFIX}request [course number] [professor] [class description]` + "\n" +
            `Example: ${PREFIX}request EE313 Cuevas Linear Systems and Signals`,

    run(message, args) {
        if(args.length<1){
            message.channel.send(new Discord.MessageEmbed()
                .setTitle("Please provide more information")
                .addField("Formatting", this.syntax));
            return;
        }
        message.channel.send(`Your request for '${args[0]}' was sent`);
        let requestmessage = new Discord.MessageEmbed()
            .addField(`${message.author.tag} requested:`, `${args.join(" ")}`);
        message.guild.members.cache.get("675355390988255245").send(requestmessage);
    }
}