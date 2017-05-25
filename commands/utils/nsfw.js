const roles = require('../../config/roles');

exports.run = (bot, message, args) => {
    const msg = message;
    message.delete();

    if (args.length != 1) {
        return bot.respondPm(msg, 'Nutze `!nsfw <join|leave>` um den NSFW Bereich zu betreten bzw. zu verlassen. Beispiel: `!nsfw join`');
    }

    const arg = args[0].toLowerCase();

    const nsfwRole = bot.server.roles.find('name', 'NSFW');
    const member = bot.getGuildMember(msg.author);

    if (arg == 'join') {
        if (!member.roles.exists('name', 'NSFW')) {
            member.addRole(nsfwRole);
            return bot.respondPm(msg, 'DerAtrox.de NSFW Bereich beigetreten. :smirk:');
        }
    } else if (arg == 'leave') {
        if (member.roles.exists('name', 'NSFW')) {
            member.removeRole(nsfwRole);
            return bot.respondPm(msg, 'DerAtrox.de NSFW Bereich verlassen.');
        }
    } else {
        return bot.respondPm(msg, 'Nutze `!nsfw <join|leave>` um den NSFW Bereich zu betreten bzw. zu verlassen. Beispiel: `!nsfw join`');
    }
};

exports.config = {
    server: true,
    enabled: false
};

exports.help = {
    name: 'nsfw',
    description: '#nsfw betreten oder verlassen.',
    usage: ['!nsfw join', '!nsfw leave']
};