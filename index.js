const Discord = require('discord.js');
const { PREFIX, TOKEN, RULES } = require('./config.json');
const client = new Discord.Client({disableMentions: "all"});

/*
    - server welcome
        - make embed message to new members in a welcome channel
        - only bots can write to the welcome channel, not casuals
    - event planner command
        - invite people to stuff
        - set reminders before the event starts
        - clickable?
 */

client.on("ready", async () => {
    console.log(`${client.user.username} is online`);
    await client.user.setActivity(`${PREFIX}help`, {type: "WATCHING"});
});

client.on("message", message => {
    if(message.content === 'test'){
        channel = message.channel;
        const embed = new Discord.MessageEmbed()
            .setColor('#00FFFF')
            .setTitle('Rules')
            .addField('Rules', RULES)
            .addField('Admins', '*add admin @s here*');

        channel.send(embed);
    }
});

client.on("guildMemberAdd", member => {
    const channel = member.guild.channels.cache.find(channel => channel.name === 'welcome');
    channel.send(`Welcome to the channel ${member.user.username}!`);
    const embed = new Discord.MessageEmbed()
        .setColor('#00FFFF')
        .setTitle('Welcome')
        .addField('Rules', RULES)
        .addField('Admins', '*add admin @s here*')
    channel.send(embed);
})

client.login(TOKEN);