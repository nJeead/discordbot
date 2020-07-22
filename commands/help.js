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
                if(i.name === undefined) continue;
                helpMessage.addField("```>\t" + `${PREFIX}${i.name}` + "\t\n\t["+ i.aliases +"]\t\t\t```",
                    "*" + i.description + "*" + "\n" + i.syntax + "\n");
            }
            // helpMessage += `${PREFIX}${i.name}` + "\n"
            //     + `[${i.aliases}]` + "\n"
            //     + `*${i.description}*` + "\n"
            //     + i.syntax + "\n";

            message.author.send(helpMessage);
        } else {
            try{ // send info on a specific command
                let helpMessage = new Discord.MessageEmbed();
                const command = message.client.commands.get(args[0])
                    || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[0]));
                helpMessage.setTitle(`${PREFIX}${command.name}`)
                    .setDescription("*" + command.description + "*")
                    .addField("Formatting: ", command.syntax);
                message.channel.send(helpMessage);
            } catch (e) {
                message.channel.send(`${args} command does not exist`);
            }
        }
    }
}
