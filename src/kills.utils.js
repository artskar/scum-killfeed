import config from './config.json' assert { type: "json" };

const { names, trapkills_only, timezone } = config;
const defaultColumnLength = 15;
const isAllSquadKillsEnabled = trapkills_only !== 'true';

const traps = [
    'Mine 01',
    'Mine 02',
    'Anti-Personnel Mine',
    'Small Anti-Personnel Mine',
    'Improvised Mine',
    'PipeBomb',
    'PromTrap',
    'PROM-1 Mine',
    'Claymore',
    'Improvised Claymore',
    'BarbedSpikeTrap',
    'StakePitTrap',
    'PressureCookerBomb',
    'CartridgeTrap',
];

const makeEmbed = (parsedKill, text = ' ') => {
    const { killer, victim, time, weapon, distance } = parsedKill;
    const sector = parsedKill.sector ? `| ${parsedKill.sector}` : '';
    return ({
        content: text,
        embeds: [{
            type: 'rich',
            color: 6591981,
            fields: [
                {
                    name: killer,
                    value: weapon ? weapon : '',
                    inline: true
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                    inline: true
                },
                {
                    name: victim,
                    value: distance ? distance : '',
                    inline: true
                }
            ],
            footer: {
                text: `${time} ${sector}`
            }
        }]
    })
};

const clean = str => str.replace(':map:', '').replace(':medal: ', '').replace(':skull_crossbones: ', '').replaceAll('*', '');
const eq = (str, limit = defaultColumnLength) => str.concat('               ').substring(0, limit);
const eqLast = (str, limit = defaultColumnLength) => '               '.concat(str).slice(-limit);
const timeZeroCorrection = num => {
    if (num < 10) {
        return '0' + num;
    }
    return num;
}
const getTime = timestamp => {
    const date = new Date(timestamp);
    const hours = timeZeroCorrection(date.getUTCHours() + Number(timezone));
    const minutes = timeZeroCorrection(date.getUTCMinutes());
    return `${hours}:${minutes}`;
}
const getFieldValue = (fields, name) => {
    const field = fields.find(field => field.name === name);
    return field ? clean(field.value) : null;
}

export const parseKillData = killData => {
    const embeds = killData.embeds && killData.embeds[0];
    if (embeds) {
        const { fields, title, description } = embeds;
        const time = killData.timestamp ? getTime(killData.timestamp) : ' ';
        const killer = clean(title);
        const victim = clean(description);
        return {
            time,
            killer,
            victim,
            weapon: getFieldValue(fields, 'Weapon'),
            distance: getFieldValue(fields, 'Distance'),
            sector: getFieldValue(fields, 'Sector')
        };
    }
    return null;
};

export const getKillLog = parsedKill => {
    if (parsedKill) {
        const killer = parsedKill.killer.length <= defaultColumnLength ? eqLast(parsedKill.killer) : eq(parsedKill.killer);
        const victim = ` - ${eq(parsedKill.victim)}`;
        const sector = parsedKill.sector ? ` | ${parsedKill.sector}` : ' |';
        const distance = parsedKill.distance ? ` ${eqLast(parsedKill.distance, 5)}` : '';
        const weapon = parsedKill.weapon ? ` - ${eq(parsedKill.weapon)}` : '';
        const fields = sector + distance + weapon;
        const time = ` ${parsedKill.time}`;
        return killer + victim + fields + time;
    }
    return 'no embeds';
};

export const getEmbedKill = parsedKill => {
    if (parsedKill) {
        const { killer, victim, distance, weapon } = parsedKill;
        if (distance && weapon) {
            const isSquadKill = names.includes(killer);
            const isSquadDeath = names.includes(victim);
            const isTrapkill = traps.includes(weapon);
            if (isSquadKill && isTrapkill) {
                return makeEmbed(parsedKill, '@everyone trapkill');
            }
            if (isAllSquadKillsEnabled) {
                return isSquadKill || isSquadDeath ? makeEmbed(parsedKill) : null;
            }
        }
    }
    return null;
};

export const parseKillToStatus = killData => {
    const embeds = killData.embeds && killData.embeds[0];
    if (embeds) {
        const killer = clean(embeds.title);
        const victim = clean(embeds.description);
        return `${eq(killer)}  -  ${victim}`;
    } else {
        return ' ';
    }
};
