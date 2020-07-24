const { PREFIX } = require('./config.json');
const Discord = require('discord.js');
const gcal = require('./GCal');

module.exports = {
    name: "subscribe",
    aliases: ["sub"],
    description: "subscribe to a specific role/class calendar",
    syntax: `${PREFIX}sub [@role] [your email]` +
            "```Example: " + `${PREFIX}sub @EXISTINGROLE myaddress@example.edu` + "```" ,
    async run(message, args) {
        if(!message.mentions.roles){
            message.channel.send("Please mention the role you would like to subscribe to.")
            return;
        }
        const calID = gcal.gcalmap.get(message.mentions.roles.first().id);
        if(!calID){
            message.channel.send(`The role you mentioned does not have a calendar. Please use '${PREFIX}request to request a calendar for this role'` )
            return;
        }
        const email = args[1];
        if(!email) {
            message.channel.send("Please enter your email");
            return;
        }

        // add email to calendar ACL and return if successful or not
        const res = await gcal.newSubscription(calID, email);
        if(res.status === 200){
            await message.react("👍");
        } else {
            message.channel.send("Something went wrong: " + res);
            console.log(res);
        }
    }
}