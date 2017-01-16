const roles = require('../../config/roles'),
    unirest = require('unirest');

exports.run = (bot, message, args) => {
    if (args.length < 1) {
        return bot.respond(message, 'Dieser Befehl benötigt zusätzliche Parameter. Mehr unter `!help derpi`');
    }

    let regexOrder = /\bo:(desc|asc)\b/i,
        regexSort = /\bby:(score|relevance|width|height|comments|random)\b/i,
        parameters = '',
        query = args.join(' ');

    if (message.channel == bot.server.channels.find('name', 'nsfw')) {
        parameters += '&filter_id=134141';
    }

    if (regexOrder.test(query)) {
        parameters += '&sd=' + query.match(regexOrder)[1];
        query = query.replace(regexOrder, '');
    }

    if (regexSort.test(query)) {
        parameters += '&sf=' + query.match(regexSort)[1];
        query = query.replace(regexSort, '');
    } else {
        parameters += '&sf=random';
    }

    query = query.replace(/,{2,}/g, ',').replace(/(^,|,$)/, '').replace(/ *, *$/, '');
    const url = 'https://derpibooru.org/search.json?q=' + encodeURIComponent(query) + parameters;
    bot.log(message.author.username + '#' + message.author.discriminator + ' - Derpibooru search: ' + url);

    unirest.get(url)
        .header("Accept", "application/json")
        .end((result) => {
            if (result.error || typeof result.body !== 'object') {
                bot.log(result.error, result.body);
                return bot.respond(message, 'Derpibooru Anfrage fehlgeschlagen (HTTP ' + result.status + ')');
            }

            const data = result.body;
            if (typeof data.search === 'undefined' || typeof data.search[0] === 'undefined')
                return bot.respond(message, 'Keine Suchergebnisse gefunden.');

            const img = data.search[0];

            if (!img.is_rendered) {
                return bot.respond(message, 'Dieses Bild wurde noch nicht von Derpibooru verarbeitet. Bitte versuche es später erneut.');
            }

            bot.respond(message, '<http://derpibooru.org/' + img.id + '>\nhttps:' + (img.image.replace(/__[^.]+(.\w+)$/, '$1')));
        });

};

exports.config = {
    aliases: ['db'],
    server: true,
    cooldown: 15,
    skip: roles.user
};

exports.help = {
    name: 'derpi',
    description: 'Gibt das erste Bild einer Derpibooru Suche zurück.\n\n' +
    'Optionen:\n' +
    ' - Reihenfolge: `o:<desc|asc>`\n' +
    ' - Sortierung: `by:<score|relevance|width|height|comments|random>`',
    usage: ['!derpi Rainbow Dash', '!derpi rd,aj by:score', '!db discord,score.gt:500']
};