const roles = require('../../config/roles'),
    table = require('text-table'),
    Discord = require('discord.js');

exports.run = (bot, message, args) => {
    const here = args.includes('here');

    if (args.length < 1 || (args.length == 1 && here)) {
        let text = '\n\nBefehle müssen `/` oder `!` vorangestellt haben. Groß- und Kleinschreibung wird nicht beachtet.\nIn PMs wird kein Präfix benötigt.\n\n';

        text += 'Liste aller Befehle, die **du** nutzen kannst:\n\n';

        let canRun = [];

        bot.commands.forEach(command => {
            if ('role' in command.config) {
                if (!bot.checkPermissions(command.config.role, message.author)) {
                    return;
                }
            }

            canRun.push(command.help.name);
        });

        let commandsTable = [],
            columns = 3;
        for (let ix = 0; ix < canRun.length; ix += columns)
            commandsTable.push(canRun.slice(ix, ix + columns));

        text += '```' + table(commandsTable, {hsep: '    '}) + '```';

        text += '\nUm mehr Infos zu einem Befehl zu erhalte nutze `!help commandname`, also zum Beispiel: `!help nsfw`.';

        if (here) {
            bot.respond(message, text, false);
        } else {
            bot.respondPm(message, text);

            if (message.channel.type == 'text') {
                message.delete();
            }
        }
    } else {
        const cmd = args[0].toLowerCase();

        if (!bot.commands.has(cmd) && !bot.aliases.has(cmd)) {
            return this.run(bot, message, []);
        }

        let cmdObj;

        if (bot.commands.has(cmd)) {
            cmdObj = bot.commands.get(cmd);
        } else if (bot.aliases.has(cmd)) {
            cmdObj = bot.commands.get(bot.aliases.get(cmd));
        }

        let embed = new Discord.RichEmbed({
            thumbnail: {
                url: bot.user.avatarURL
            },
            title: `Hilfe für den Befehl \`${cmdObj.help.name}\`:`,
            description: cmdObj.help.description,
            color: 0xEA428B
        });

        if ('role' in cmdObj.config) {
            embed.addField('Benötiger Rang', cmdObj.config.role, true);
        }

        if ('cooldown' in cmdObj.config) {
            embed.addField('Cooldown', cmdObj.config.cooldown + ' Sekunden', true);

            if ('skip' in cmdObj.config) {
                embed.addField('Cooldown wird ignoriert ab', cmdObj.config.skip, true);
            }
        }

        if ('aliases' in cmdObj.config) {
            embed.addField('Alias', cmdObj.config.aliases.join(' / '), true);
        }

        embed.addField('Beispiele', '```' + cmdObj.help.usage.join('\n') + '```');

        if (here) {
            message.channel.sendEmbed(embed);
        } else {
            message.author.sendEmbed(embed);

            if (message.channel.type == 'text') {
                message.delete();
            }
        }
    }
};

exports.config = {};

exports.help = {
    name: 'help',
    description: 'Zeigt alle verfügbaren Befehle bzw. Informationen zu einzelnen Befehlen an.\n\nMit dem Parameter `here` wird die Hilfe im aktuellen Channel und nicht im privaten Chat angezeigt. Dieser Parameter muss immer am Ende stehen.',
    usage: ['!help', '!help version', '!help nsfw here']
};