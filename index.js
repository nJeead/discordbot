const Discord = require('discord.js');
const { PREFIX, TOKEN } = require('./botconfig.json');
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
        message.reply(message.author.displayAvatarURL());
    }
});

client.on("guildMemberAdd", member => {
    const channel = member.guild.channels.cache.find(channel => channel.name === 'general');
    channel.send(`${member.user.username} joined the channel!`);
})

client.login(TOKEN);