const Commando = require('discord.js-commando');
const path = require('path');
const Raven = require('raven');

const config = require('./config');

const log = require('./lib/Logger');
const Guild = require('./db/models/guilds/Guild');

const ServerStatusWorker = require('./workers/ServerStatusWorker');
const MoviesWorker = require('./workers/MoviesWorker');

if (config.bot.sentry.secret && config.bot.sentry.id) {
  const dsn = `https://${config.bot.sentry.public}:${config.bot.sentry.secret}@sentry.io/${config.bot.sentry.id}`;
  Raven.config(dsn).install();
}

const client = new Commando.Client({
  commandPrefix: config.bot.prefix,
  disableEveryone: true,
  owner: config.bot.owner,
  unknownCommandResponse: false
});

client
  .registry
  .registerDefaultTypes()
  .registerGroups([
    [ 'fun', 'Fun commands' ],
    [ 'maintenance', 'Maintenance features' ],
    [ 'moderation', 'Moderation' ],
    [ 'boop', 'Boop commands' ],
    [ 'custom', 'Custom commands' ]
  ])
  .registerDefaultGroups()
  .registerDefaultCommands({
    help: false
  })
  .registerCommandsIn(path.join(__dirname, 'commands'));

client.on('ready', () => {
  console.log('Bot started.');

  if (config.bot.activity) {
    client.setActivity(config.bot.activity);
  }

  ServerStatusWorker(client);
  MoviesWorker(client);
});

client.on('message', message => {
  if (message.guild && message.content.startsWith(config.bot.prefix)) {
    const command = message.content.slice(1).split(' ')[0].toLowerCase();

    if (client.registry.commands.array().find(cmd => cmd.name === command || cmd.aliases.includes(command))) {
      log(client, message, command);
    }
  }
});

client.on('guildCreate', guild => {
  return Guild.create({ guildId: guild.id })
    .catch(err => console.error(err));
});

client.on('guildDelete', guild => {
  return Guild.destroy({ where: { guildId: guild.id } })
    .catch(err => console.error(err));
});

client.login(config.bot.token);
