const Discord = require('discord.js');
const { Client, Intents } = require('discord.js');
const fetch = require('node-fetch');
const { authorization, source_channel, target_channel, cookie, token, debug } = require('./config.json');

const robot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const messagesCount = 10;
const requestTime = 30 * 1000;
const isDebug = debug === 'true';
const names = [
  'ncux',

  'Mayasaur',

  'MyFight',
  'MF',
  'pshepshe',

  'Aggressor',
  'Помада Кентавра',
  'JIowaDka',
  'Unbalanced',

  'Bomzara',
  'JohnyBoy',
  'BillyBoy',

  'Godhead',
  'Surprise!',
];

const traps = [
  'Mine 01',
  'Mine 02',
  'Improvised Mine',
  'PipeBomb',
  'PromTrap',
  'Claymore',
  'Improvised Claymore',
  'BarbedSpikeTrap',
  'StakePitTrap',
  'PressureCookerBomb',
  'CartridgeTrap',
];

const getEmbed = (killer, victim, weapon, distance, text = ' ') => ({
  content: text,
  embeds: [{
    type: 'rich',
    color: 6591981,
    fields: [
      {
        name: killer,
        value: weapon,
        inline: true
      },
      {
        name: '\u200B',
        value: '\u200B',
        inline: true
      },
      {
        name: victim,
        value: distance,
        inline: true
      }
    ]
  }]
});

const clean = str => str.replace(':medal: ', '').replace(':skull_crossbones: ', '').replaceAll('*', '')
const isContainId = idArray => ({ id }) => idArray.findIndex(item => item.id === id) < 0;
const log = str => isDebug && console.log(str);
const eq = (str, limit = 10) => str.concat('               ').substring(0, limit);

const parseKill = killData => {
  const embeds = killData.embeds && killData.embeds[0];
  if (embeds) {
    const killer = clean(embeds.title);
    const victim = clean(embeds.description);
    const fields = embeds.fields.map(field => field.value);
    if (fields.length > 1) {
      const weapon = clean(fields[0]);
      const distance = clean(fields[1]);
      log(`${eq(killer)}  -  ${eq(victim)}  |  ${eq(weapon)}  -  ${distance}`);
      if (names.includes(killer) || names.includes(victim)) {
        if (traps.includes(weapon) && names.includes(killer)) {
          return getEmbed(killer, victim, weapon, distance, '@everyone trapkill');
        }
        return getEmbed(killer, victim, weapon, distance);
      }
      return null;
    }
    log(`no fields: ${eq(killer)}  -  ${victim}`);
    return null;
  } else {
    log('no embeds', killData);
    return null;
  }
};
const fetchEffect = (prevKillfeed = []) => {
  const channel = robot.channels.cache.get(target_channel);

  fetch(`https://discord.com/api/v9/channels/${source_channel}/messages?limit=${messagesCount}`, {
    method: 'GET',
    headers: {
      authorization,
      cookie
    },
  })
    .then(response => response.json())
    .then(
      data => {
        const newKills = data.filter(isContainId(prevKillfeed));
        const newKillfeed = [...newKills, ...prevKillfeed].slice(0, messagesCount);
        const kills = newKills.map(parseKill).filter(kill => kill !== null);
        if (newKills.length) {
          kills.reverse().map(kill => channel.send(kill));
        }
        setTimeout(() => fetchEffect(newKillfeed), requestTime);
      },
      reject => {
        console.log('Fetch rejected', reject);
        channel.send('Fetch rejected', JSON.stringify(reject));
      });
};

robot.on('ready', function () {
  console.log(robot.user.username + ' is run!');
  fetchEffect();
});

robot.login(token);
