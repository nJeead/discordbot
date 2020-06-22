const fs = require('fs');
const Discord = require('discord.js');
const { PREFIX, TOKEN, RULES } = require('./commands/config.json');

const client = new Discord.Client({disableMentions: "all"});
client.commands = new Discord.Collection();

const commandfiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for(const file of commandfiles){
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}
/*
    - event planner command
        - invite people to stuff
        - set reminders before the event starts
        - clickable?
 */

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

    if(!client.commands.has(command)) return;
    client.commands.get(command).run(message, args);
});

client.on("guildMemberAdd", member => {
    const channel = member.guild.channels.cache.find(channel => channel.name === 'welcome');
    channel.send(`Welcome to the server, ${member.user.username}!`);
    const embed = new Discord.MessageEmbed()
        .setColor('#00FFFF')
        .setTitle('Welcome')
        .addField('Rules', RULES);
    var role = member.guild.roles.cache.find(role => role.name === "casual");
    member.roles.add(role);
    channel.send(embed);
})

client.login(TOKEN);