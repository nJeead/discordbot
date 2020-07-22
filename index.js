const fs = require('fs');
const Discord = require('discord.js');
const { PREFIX, DISCORDTOKEN, RULES } = require('./commands/config.json');

// let {initgcalmap} = require('./commands/GCal');
// initgcalmap();

//create new client and collection of commands
const client = new Discord.Client({disableMentions: "all"});
client.commands = new Discord.Collection();

// find all command files and add to map of commands
const commandfiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for(const file of commandfiles){
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// delete files that are not commands or commands that are only for testing
client.commands.delete("eventObject");
client.commands.delete("test");
client.commands.delete("GCal");

// print to console and set bot activity when ready
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

    // separate message into args and command
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    // find command by name or alias then run
    const cmd = client.commands.get(command)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command));
    if(!cmd) return;

    cmd.run(message, args);
});

// send welcome message and set to default role when new member is added
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

// connect to discord with token
client.login(DISCORDTOKEN);
// client.login(process.env.DISCORDTOKEN).then(r => console.log(r));