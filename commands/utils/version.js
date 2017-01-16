const roles = require('../../config/roles'),
    moment = require('moment'),
    Discord = require('discord.js');

exports.run = (bot, message, args) => {
    const linkLastCommit = 'https://github.com/DerAtrox/DerAtrox.de-DSB/commit/' + bot.versionInfo.version;

    let embed = new Discord.RichEmbed({
        author: {
            name: bot.server.name,
            icon_url: bot.server.iconURL,
            url: 'http://bronies.de/'
        },
        thumbnail: {
            url: bot.user.avatarURL
        },
        title: `DerAtrox/DerAtrox.de-DSB@` + bot.versionInfo.version,
        description: 'Umgesetzt mit Hilfe von [Node.js](https://nodejs.org/) und [discord.js](https://discord.js.org/).',
        fields: [
            {
                name: 'Version',
                value: bot.versionInfo.version,
                inline: true
            },
            {
                name: 'Letzter Commit',
                value: `[${linkLastCommit}](${linkLastCommit})`,
                inline: true
            }
        ],
        color: 0x632E86
    });

    if('message' in bot.versionInfo) {
        embed.addField('Letzte Commitnachricht', bot.versionInfo.message, true);
    }

    if('timestamp' in bot.versionInfo) {
        embed.addField('Erstellt', (moment(bot.versionInfo.timestamp, 'YYYY-MM-DD HH:mm:ss Z').locale('de').fromNow()), true);
    }

    message.channel.sendEmbed(embed);
};

exports.config = {
    aliases: ['ver'],
    cooldown: 60,
    skip: roles.moderator
};

exports.help = {
    name: 'version',
    description: 'Zeigt die aktuelle Version des Bots an.',
    usage: ['!version']
};