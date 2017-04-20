const Discord = require('discord.js');
const config = require("./config.json");
const request = require('request');
const client = new Discord.Client();
const commands = [
    "",
    "* Help\xa0 : Returns all commands",
	"* Ping\xa0 : Returns 'pong'", 
	"* Talk\xa0 : Returns random phrases",
    "* Hello\xa0 : Says hello back",

];

var responses = [
    "Hey.",
    "No.",
    "Why?",
    "How?",
    "I don't know.",
    "Ask Jett.",
    "Yes.",
    "Agreed.",
    "Bye.",
    "Boi.",
];

var userApi = "http://www.khanacademy.org/api/internal/user/profile?username=";
var getKAData = function(api, user, callback) {
    request(api + user, function(error, response, body) {
        if (!JSON.parse(body)) {
            message.channel.sendMessage('That profile doesn\'t exist');
            return;
        }
        callback(body);
    });
};

let URL = "https://www.kasandbox.org/programming-images/avatars/leaf-green.png";
let embed = new Discord.RichEmbed(); 
embed.setColor("#0FF0FF");
embed.setThumbnail(URL);
embed.addField("My commands)", commands);

client.on('ready', () => {
    console.log('I am ready!');
});

client.on('message', message => {
    if (!message.content.startsWith(config.prefix)) return
    if (message.author.id === client.user.id) return
    if (message.author.bot) return;

    let command = message.content.split(" ")[0];
    command = command.slice(config.prefix.length).toLowerCase();

    let args = message.content.split(" ").slice(1);

    if (command === 'ping') {
        message.channel.sendMessage("pong!");
    }
    else if (command === 'help') {
        message.channel.sendEmbed(embed);
    }
    else if (command === 'add') {
        let numArray = args.map(n=> parseInt(n));
        let total = numArray.reduce( (p, c) => +p + +c);

        message.channel.sendMessage(total);
    } else
    if (command === "hello") {
        message.channel.sendMessage(`Hello ${message.author.username}!`);
    } else
    if (command === 'talk') {
        message.channel.sendMessage(responses[Math.round(Math.random(0, 1)*10)]);
    } else 
    if (command === 'userinfo' && args.length === 2) {
        if (args[1] === 'points') {
            getKAData(userApi, args[0], function(body) {
                message.channel.sendMessage('```js\n' + args[0] + ' has ' + JSON.parse(body).points + ' points.```');
            });
        } else
        if (args[1] === 'joined') {
            getKAData(userApi, args[0], function(body) {
                var d = new Date(JSON.parse(body).dateJoined)
                var date = ("0"+(d.getMonth()+1)).slice(-2) + "/" + ("0" + d.getDate()).slice(-2) + "/" + d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
                message.channel.sendMessage('```js\n' + args[0] + ' joined Khan Academy on ' + date + '```');
            });
        } else
        if (args[1] === 'badges') {
            getKAData(userApi, args[0], function(body) {
                var kaid = JSON.parse(body).kaid;

                if (kaid.substring(0, 5) === 'kaid_') {
                    getKAData('http://www.khanacademy.org/api/internal/user/' + kaid + '/profile/widgets', '', function(widgets) {
                        try {
                            var badgeWidget = JSON.parse(widgets).filter(function(widget){return widget.widgetId === "BadgeCountWidget"})[0].renderData.badgeCountData.counts;
                            let total = 0;
                            badgeWidget.forEach(function(counts) {
                                total += counts.count;
                            });
                            message.channel.sendMessage('```js\n' + args[0] + ' has ' + total + ' badges.```');
                        }
                        catch(badgeWidget) {
                            message.channel.sendMessage('```js\n' + 'This user has no public badges to count.```');
                        }
                    });
                } else {
                    message.channel.sendMessage('That KAID does not exist.');
                }
            });
        } else {
            message.channel.sendMessage('```js\n' + 'That command is not defined. Use **userinfo help** for more.```')
        }

    } else
    if (command === 'userinfo' && args[0] === 'help' && args.length === 1) {
        message.channel.sendMessage('```Markdown\n' + 'List of userinfo commands goes here.```');
    } else {
        message.channel.sendMessage('```Markdown\n' + 'Use **help** for more.```');
    }
});

client.login(config.token);
