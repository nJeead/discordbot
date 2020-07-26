const { PREFIX } = require('./config.json');
const Discord = require('discord.js');
const gcal = require('./GCal');

module.exports = {
    name: "subscribe",
    aliases: ["sub"],
    description: "subscribe to a specific role/class calendar",
    syntax: `${PREFIX}sub [@role(s)], email: [your email]` +
            "```Example: " + `${PREFIX}sub @Role1 , @Role2 , email: myemail@example.edu` + "```" ,
    async run(message, args) {
        if(!message.mentions.roles){
            message.channel.send("Please mention the role(s) you would like to subscribe to.")
            return;
        }
        const email = this.getParam(args.join(" "), "email");
        if(!email) {
            message.channel.send("Please enter your email");
            return;
        }

        message.mentions.roles.forEach( role => {
            const calID = gcal.gcalmap.get(role.id);
            if(!calID){
                message.channel.send(`'${role.name}' does not have a calendar. Please use '${PREFIX}request to request a calendar for this role'` )
                return;
            }

            // add email to calendar ACL and return if successful or not
            gcal.newSubscription(calID, email)
                .then((res,err) => {
                    if(res.status === 200){
                         message.react("👍")
                            .then(() => console.log("Reaction sent"))
                            .catch(err => console.error("Sending reaction: ", err));
                    } else {
                        message.channel.send("Something went wrong: " + err);
                        console.log(err);
                    }
                });
        })
    },
    getParam(args, param) {
        let regex = new RegExp(`${param}:( ?)(.*?)([,]|$)`, 'i');
        try {
            return args.match(regex)[2];
        } catch (e) {
            return null;
        }
    },
}