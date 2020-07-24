const {PREFIX} = require('./config.json');
const Discord = require('discord.js');

module.exports = {
    name: "request",
    aliases: ["requestclass", "req"],
    description: "a message with the requested class information will be sent to all admins",
    syntax: `${PREFIX}request [course number] [professor] [class description]` + "\n" +
            "```" + `Example: ${PREFIX}request EE313 Cuevas Linear Systems and Signals` + "```",

    run(message, args) {
        if(args.length<1){
            message.channel.send(new Discord.MessageEmbed()
                .setTitle("Please provide more information")
                .addField("Formatting", this.syntax));
            return;
        }

        let requestmessage = new Discord.MessageEmbed()
            .addField(`${message.author.tag} requested:`, `${args.join(" ")}`);

        // search through members and send a DM to all admins
        message.guild.members.cache.forEach(i => {
            if(message.channel.permissionsFor(i).has("ADMINISTRATOR", false)){
                i.send(requestmessage).then(r => console.log(r));
            }
        })
        message.react(`👍`).then(r => console.log(r));
    }
}