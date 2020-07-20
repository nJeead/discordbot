const fs = require('fs');
const Discord = require('discord.js');
const { PREFIX, DISCORDTOKEN, RULES } = require('./commands/config.json');

// let {initgcalmap} = require('./commands/GCal');
// initgcalmap();

const client = new Discord.Client({disableMentions: "all"});
client.commands = new Discord.Collection();

const commandfiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for(const file of commandfiles){
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}
client.commands.delete("eventObject");
// client.commands.delete("test");
client.commands.delete("GCal");

client.on("ready", async () => {
    console.log(`${client.user.username} is online`);
    await client.user.setActivity(`${PREFIX}help`, {type: "WATCHING"});
});
/*
https://discordjs.guide/command-handling/dynamic-commands.html#how-it-works
 */
client.on("message", message => {
    const prefix = `${PREFIX}`;
    if(!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    // if(!client.commands.has(command)) return;
    const cmd = client.commands.get(command)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command));
    if(!cmd) return;

    cmd.run(message, args);
});

client.on("guildMemberAdd", member => {
    // const channel = member.guild.channels.cache.find(channel => channel.name === 'welcome');
    member.send(`Welcome to the server, ${member.user.username}!`);
    const embed = new Discord.MessageEmbed()
        .setColor('#00FFFF')
        .setTitle('Welcome')
        .addField('Rules', RULES);
    var role = member.guild.roles.cache.find(role => role.name === "casual");
    member.roles.add(role);
    member.send(embed);
})

client.login(DISCORDTOKEN);
// client.login(process.env.token);