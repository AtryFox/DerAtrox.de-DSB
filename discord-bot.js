var Discord = require('discord.js'),
    config = require('./config'),
    token = config.TOKEN,
    bot = new Discord.Client(),
    server,
    version,
    exec;

/* VERSION */
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

/* BOT EVENTS */
bot.on('ready', function () {
    online();
    console.log('I am ready!');
    getVersion(function (v) {
        version = v;
        bot.user.setGame('version ' + version);

        if (config.DEBUG) bot.channels.find('id', config.BOT_CH).sendMessage('I am ready, running version `' + version + '`! 👌');
    });

    if (!bot.guilds.exists('id', config.SERVER_ID)) {
        console.log('Bot is not connected to the selected server!');
        process.exit();
    }

    server = bot.guilds.find('id', config.SERVER_ID);
});

bot.on('guildMemberAdd', function (member) {
    bot.channels.find('id', config.DEFAULT_CH).sendMessage('Herzlich Willkommen, ' + member);
});

function onMessage(message) {
    if (message.author.id == bot.user.id) {
        return;
    }

    if (message.channel.type == 'group') {
        return;
    }

    function handleCommand() {
        var match = /^[\/!]([a-zA-Z]+).*$/.exec(message.content);

        if (message.channel.type == 'dm') {
            match = /^[\/!]?([a-zA-Z]+).*$/.exec(message.content);
        }

        if (match) {
            var args = message.content.split(' ').splice(1);

            processCommand(message, match[1].toLowerCase(), args);
        }
    }

    if (server.channels.exists('id', message.channel.id)) {
        handleCommand();
    } else {
        if (server.members.exists('id', message.author.id)) {
            handleCommand();
        } else {
            return message.channel.sendMessage('You have to be member ' + server.name + '!');
        }
    }
}

bot.on('message', onMessage);

bot.on('messageUpdate', function (oldMessage, newMessage) {
    if (typeof newMessage.author === 'undefined')
        return;

    onMessage(newMessage);
});

/* PERMISSIONS */
function Permission(checker) {
    return {
        check: function (user) {
            if (!server.members.exists('id', user.id)) {
                return false;
            }

            var member = server.members.find('id', user.id);

            return checker(member);
        }
    };
}

var isAdmin = new Permission(function (member) {
    return member.roles.exists('name', 'Administrator');
});

var isMod = new Permission(function (member) {
    return isAdmin.check(member) ? true : member.roles.exists('name', 'Moderator');
});

var isUser = new Permission(function (member) {
    return isMod.check(member) ? true : member.roles.exists('name', 'Stammnutzer');
});


function respond(message, response, pm) {
    if (typeof pm === 'undefined') {
        pm = false;
    }

    if (pm) {
        message.author.sendMessage(response);
    } else {
        message.reply(response);
    }
}

/* COMMAND PROCESSING */
function processCommand(message, command, args) {
    switch (command) {
        case 'help':
            (function () {
                var text = '\n\nBefehle müssen `/` oder `!` vorangestellt haben. Groß- und Kleinschreibung wird nicht beachtet.\nIn PMs wird kein Präfix benötigt.\n\n';

                text += 'Liste aller Befehle, die **du** nutzen kannst:\n\n';

                commands.forEach(function (command) {
                    if (command.role == "Administrator") {
                        if (!isAdmin.check(message.author)) {
                            return;
                        }
                    } else if (command.role == "Moderator") {
                        if (!isMod.check(message.author)) {
                            return;
                        }
                    } else if (command.role == "Stammnutzer") {
                        if (!isUser.check(message.author)) {
                            return;
                        }
                    }

                    text += '**`' + command.name + '`**';
                    if ('aliases' in command) {
                        text += ' (alternativ: ';
                        text += '`' + command.aliases.join('`, `');
                        text += '`)';
                    }

                    text += '\n```' + command.help + '```\n\n';
                });

                respond(message, text, true);
                if (message.channel.type == 'text') {
                    message.delete();
                }
            })();
            break;
        case 'ver':
        case 'version':
            (function () {
                respond(message, "DerAtrox.de DSB version `" + version + "`.\nAktuellster Commit: https://github.com/DerAtrox/DerAtrox.de-DSB/commit/" + version);
            })();
            break;
        case 'about':
        case 'who':
        case 'whois':
            (function () {
                if (!isMod.check(message.author)) {
                    return respond(message, 'Du besitzt nicht genügend Rechte!');
                }

                var member;

                if (args == "") {
                    member = server.members.find('id', message.author.id);


                } else {
                    var search = args.join(' ');

                    if (bot.users.exists('username', search)) {
                        if (server.members.exists('id', bot.users.find('username', search).id)) {
                            member = server.members.find('id', bot.users.find('username', search).id);
                        } else {
                            return respond(message, 'Der Nutzer `' + search + '` ist nicht auf diesem Server.');
                        }
                    } else {
                        return respond(message, 'Der Nutzer `' + search + '` ist konnte nicht gefunden werden.');
                    }
                }

                var data = {};

                data.id = member.user.id;
                data.username = member.user.username;
                data.discriminator = member.user.discriminator;
                data.nick = member.nickname;
                data.bot = member.user.bot;
                data.roles = [];

                member.roles.forEach(function (role) {
                    data.roles.push(role.name);
                });

                respond(message, 'Nutzerinformationen:```json\n' + JSON.stringify(data, null, '\t') + '```');
            })();
            break;
        case 'del':
        case 'delete':
            (function () {
                if (!isMod.check(message.author)) {
                    return respond(message, 'Du besitzt nicht genügend Rechte!');
                }

                if (message.channel.type != 'text') {
                    return respond(message, 'Dieser Befehl muss auf dem Server ausgeführt werden.', true)
                }

                if (isNaN(args[0])) {
                    respond(message, "Limit muss angegeben werden! Beispiel: `/help 4`");
                    return;
                }

                var limit = args[0];

                if (limit > 5 && !isAdmin.check(message.author)) {
                    respond(message, "Es können maximal 5 Nachrichten entfernt werden.");
                    return;
                }

                if (limit < 1) {
                    respond(message, "Es muss mindestens eine Nachricht entfernt werden.");
                    return;
                }

                message.channel.fetchMessages({limit: limit, before: message.id}).then(function (messages) {
                    messages.forEach(function (message) {
                        if (args.includes('-f') && isAdmin.check(message.author)) {
                            message.delete();
                        } else if (!message.pinned && message.type == 'DEFAULT') {
                            message.delete();
                        }
                    });
                });

                if (!args.includes('-s')) {
                    if (limit == 1) {
                        respond(message, "Es wurden die letzte Nachricht entfernt.");
                    } else {
                        respond(message, "Es wurden die letzten " + limit + " Nachrichten entfernt.");
                    }
                }

                message.delete();
            })();
            break;
    }
}

var commands = [
    {
        name: 'help',
        help: 'Zeigt alle verfügbaren Befehle an.'
    },
    {
        name: 'version',
        help: 'Zeigt die verwendete DerAtrox.de DSB Version an.',
        aliases: ['ver']
    },
    {
        name: 'whois [Nutzername]',
        help: 'Zeigt Informationen über sich selber oder einen Benutzer an.',
        aliases: ['who', 'about'],
        role: 'Moderator'
    },
    {
        name: 'delete [Anzahl] [-f]',
        help: 'Löscht die letzten Nachrichten in einem Channel. Der Parameter -f erzwingt das Löschen.',
        aliases: ['del'],
        role: 'Administrator'
    }
];

/* GENERAL APPLICATION STUFF */
process.on('exit', idle);

process.on('SIGINT', function () {
    idle();
    process.exit();

});

function idle() {
    bot.user.setStatus('idle');
}

function online() {
    bot.user.setStatus('online');
}

/* LOGIN */
bot.login(token);

