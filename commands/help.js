const {PREFIX} = require('./config.json');
const Discord = require('discord.js');

module.exports = {
    name: "help",
    aliases: [""],
    description: "provides list of commands and their basic formatting",
    syntax: `${PREFIX}help` + "\n" +
            `${PREFIX}help [command]`,
    run(message, args) {
        if(args.length === 0){
            // send info on all commands
            let helpMessage = new Discord.MessageEmbed()
                .setTitle("Commands List")
                .setColor("#00FFFF");
            for(const i of message.client.commands.values()){
                helpMessage.addField(`${PREFIX}${i.name}`, "*" + i.description + "*" + "\n" + i.syntax);
            }
            message.author.send(helpMessage);
        } else {
            try{ // send info on a specific command
                let helpMessage = new Discord.MessageEmbed();
                let command = message.client.commands.get(args[0]);
                helpMessage.setTitle(`${PREFIX}${command.name}`)
                    .setDescription("*" + command.description + "*")
                    .addField("Formatting: ", command.syntax);
                message.author.send(helpMessage);
            } catch (e) {
                message.author.send(`${args} command does not exist`);
            }
        }
    }
}
