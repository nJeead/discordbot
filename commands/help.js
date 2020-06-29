const {PREFIX} = require('./config.json');
const Discord = require('discord.js');

module.exports = {
    name: "help",
    description: "provides list of commands and their basic formatting",
    syntax: [
        `${PREFIX}help`
    ],
    run(message, args) {
        if(args.length === 0){
            let helpMessage = new Discord.MessageEmbed()
                .setTitle("Commands List")
                .setColor("#00FFFF");
            for(const i of message.client.commands.values()){
                helpMessage.addField(`${PREFIX}${i.name}`, i.description + "\n" + i.syntax);
            }
            message.channel.send(helpMessage);
        } else {
            try{
                let helpMessage = new Discord.MessageEmbed();
                let command = message.client.commands.get(args[0]);
                helpMessage.setTitle(`${PREFIX}${command.name}`)
                    .setDescription(command.description)
                    .addField("Formatting: ", command.syntax);
                message.channel.send(helpMessage);
            } catch (e) {
                message.channel.send(`${args} command does not exist`);
            }
        }
    }
}
