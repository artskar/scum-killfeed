import { Client, Intents } from 'discord.js';
import fetch from 'node-fetch';
import auth from './auth.json' assert { type: "json" };
import config from './config.json' assert { type: "json" };
import { getEmbedKill, getKillLog, parseKillData, parseKillToStatus } from './kills.utils.js';

const { authorization, source_channel, target_channel, cookie, token, debug } = auth;
const { with_logs } = config;

const isProduction = debug !== 'true';
const withLogs = with_logs === 'true';

const messagesCount = 10;
const requestTime = 30 * 1000;

const robot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const errorState = {
  isError: false,
  timer: 2.5,
  setError(state) {
    this.isError = state;
    if (state === true) {
      this.updateTimer();
    } else {
      this.resetTimer();
    }
  },
  updateTimer() {
    this.timer = this.timer * 2;
  },
  resetTimer() {
    this.timer = 2.5;
  }
};

const isContainId = idArray => ({ id }) => idArray.findIndex(item => item.id === id) < 0;

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
      killFeed => {
        const newKills = killFeed.filter(isContainId(prevKillfeed));
        const newKillfeed = [...newKills, ...prevKillfeed].slice(0, messagesCount);
        const parsedKills = newKills.reverse().map(parseKillData);
        const kills = parsedKills.reduce((filtered, kill) => {
          const embed = getEmbedKill(kill);
          embed && filtered.push(embed);
          return filtered;
        }, []);

        if (withLogs) {
          parsedKills.map(kill => console.log(getKillLog(kill)));
        }

        if (isProduction && newKills.length) {
          kills.map(kill => {
            channel.send(kill);
          });

          robot.user.setActivity(parseKillToStatus(newKills.at(-1)), {
            type: 'WATCHING',
          });

          if (errorState.isError) {
            robot.user.setStatus({
              status: 'online',
            });
            withLogs && console.log('Bot Is back on duty after an Error');
            const isNotFirstTimeError = errorState.timer !== 2.5;
            if (isNotFirstTimeError) {
              channel.send(robot.user.username + ' is back on duty after an Error!');
            }
            errorState.setError(false);
          }
        }

        setTimeout(() => fetchEffect(newKillfeed), requestTime);
      },
      reject => {
        if (isProduction) {
          const isFirstTimeError = errorState.timer === 2.5;

          if (!isFirstTimeError) {
            const isThirdTimeError = errorState.timer > 5;
            const showEveryone = isThirdTimeError ? '' : '@everyone ';
            const advice = isThirdTimeError ? '' : 'probably auth.json data update needed ';
            channel.send(showEveryone + 'Fetch rejected, next Fetch in ' + errorState.timer + ' minutes' + '```' + JSON.stringify(reject) + '```' + advice);
          }

          robot.user.setStatus({
            status: 'offline',
          });
        }

        console.log('Fetch rejected, probably auth.json data update needed, next Fetch in ' + errorState.timer + ' minutes', reject);

        setTimeout(() => {
          errorState.setError(true);
          fetchEffect(newKillfeed);
        }, errorState.timer * 60 * 1000);
      });
};

robot.on('ready', function () {
  console.log(robot.user.username + ' is on duty!');

  robot.channels.cache.get(target_channel).send(robot.user.username + ' is on duty!');

  robot.user.setStatus({
    status: 'online',
  });

  robot.user.setActivity('killfeed', {
    type: 'WATCHING',
  });

  fetchEffect();
});

if (isProduction) {
  robot.login(token);
} else {
  console.log('Debug is run!');
  fetchEffect();
}
