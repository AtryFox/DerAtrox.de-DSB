var Discord = require('discord.js'),
    config = require('./config'),
    token = config.TOKEN,
    bot = new Discord.Client(),
    version,
    exec;

function getVersion(callback) {
    exec = exec || require('child_process').exec;

    exec('git rev-parse --short=4 HEAD', function (error, version) {
        if (error) {
            console.log('Error getting version', error);
            return callback('unknown');
        }

        callback(version.trim());
    });
}

bot.on('ready', function () {
    console.log('I am ready!');
    getVersion(function (v) {
        version = v;
        bot.user.setGame('version ' + version);

        if (config.DEBUG) bot.channels.find('id', config.BOT_CH).sendMessage('I am ready, running version ' + version + '!');
    });
});

bot.on('message', function (message) {
    if (message.author.id == bot.user.id) {
        return;
    }
});

bot.login(token);

