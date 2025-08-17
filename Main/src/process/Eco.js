const [aura, volley] = [[0, 24, 18, 12], [0, 20, 15, 10]]
const upgrades = {
    attack: [0.5, 0.75, 1, 1.25, 1.6, 2, 2.5, 3, 3.6, 3.8, 4.2, 4.7],
    defence: [10, 40, 55, 62.5, 70, 75, 79, 82, 84, 86, 88, 90],
    damage: [1000, 1400, 1800, 2200, 2600, 3000, 3400, 3800, 4200, 4600, 5000, 5400],
    health: [ 300000, 450000, 600000, 750000, 960000, 1200000, 1500000, 1860000, 2220000, 2580000, 2940000, 3300000]
}

let sessionwar=0

class War {
    constructor(war) {
        // this.raw = war
        const [dmg, attack] = [war.StartDMG.split('-'), Number(war.attack.replace(/[x]/g, ''))]
        const endDmg = war.EndDMG.split('-')
        this.meta = {guild: war.Guild, cons: war.Cons, terr: war.Territory, externals: war.externals, multiplier: war.HQ? (1+(0.3*war.Cons))*(1+(0.5+0.25*(war.Cons+war.externals))): (1+(0.3*war.Cons))}
        this.tower = {
            base: {dmg: {min: dmg[0], max: dmg[1]}, attack, health: war.StartHP, defence: war.defence.replace(/[%]/g, '')},
            Sdps: [Number(dmg[0]*attack), Number(dmg[1]*attack)],
            Sehp: Number(war.StartHP / (1-(war.defence.replace(/[%]/g, '')/100))).toFixed(1),
            Edps: [Number(endDmg[0]*attack), Number(endDmg[1]*attack)],
            Eehp: Number(war.EndHP / (1-(war.defence.replace(/[%]/g, '')/100))).toFixed(1),
            EDmg: endDmg[0]+'-'+endDmg[1],
            EHP: war.EndHP //this is end hp NOT eeffeicenve hp, effive hp is SEHP or EEHP
        }
        this.warPDetails = {
            duration: war.duration,
            avgDPS: Number(((this.tower.Sehp-this.tower.Eehp)/war.duration).toFixed(0)),
            HQ: war.HQ
        }
        this.bonuses = {
            aura: aura.indexOf(war.aura? rounddownarr(war.aura, [12, 18, 24]): 0),
            volley: volley.indexOf(war.volley? rounddownarr(war.volley, [10, 15, 20]): 0)
        }
        this.upgrades = {
            dmg: upgrades.damage.indexOf(roundnear(upgrades.damage, Number(dmg[0]/this.meta.multiplier))),
            attack: upgrades.attack.indexOf(attack),
            health: upgrades.health.indexOf(roundnear(upgrades.health, Number(this.tower.base.health/this.meta.multiplier))),
            defence: upgrades.defence.indexOf( Number(war.defence.replace(/[%]/g, '')) ),
        }
    }
}

function CWar(war) {
    sessionwar++
    const bt = new War(war)
    const str = [
        `${bt.warPDetails.HQ? `HQ War`: `War`}: #${sessionwar}`,
        '',
        `Territory: ${bt.meta.terr}`,
        `Guild: ${bt.meta.guild}`,
        `Duration: ${bt.warPDetails.duration}s`,
        `DPS: ${smol(bt.warPDetails.avgDPS)}`,
        '',
        `InitialStats:`,
        `- DMG: ${bt.tower.base.dmg.min}-${bt.tower.base.dmg.max} (${smol(bt.tower.Sdps[0])}-${smol(bt.tower.Sdps[1])} DPS)`,
        `- ATK: ${bt.tower.base.attack}x`,
        `- HP: ${smol(bt.tower.base.health)} (${smol(bt.tower.Sehp)} EHP)`,
        `- DEF: ${bt.tower.base.defence}%`,
        '', 
        `FinalStats:`,
        `- DMG: ${bt.tower.EDmg} (${smol(bt.tower.Edps[0])}-${smol(bt.tower.Edps[1])} DPS)`,
        `- ATK: ${bt.tower.base.attack}x`,
        `- HP: ${smol(bt.tower.EHP)} (${smol(bt.tower.Eehp)} EHP)`,
        `- DEF: ${bt.tower.base.defence}%`,
        '',
        'Eco:',
        `- Upgrades: ${bt.upgrades.dmg}-${bt.upgrades.attack}-${bt.upgrades.health}-${bt.upgrades.defence}`,
        `- Bonuses: 0-0-${bt.bonuses.aura}-${bt.bonuses.volley}`,
    ]
    Chat.log(Chat.createTextBuilder()
        .append('[War] ').withColor(210, 1, 3)
        .append(`${bt.meta.terr} taken from `)
        .append(bt.meta.guild).withColor(106, 104, 186)
        .append(`\n- Time: ${bt.warPDetails.duration}s `)
        .append(`View More`).withColor(125, 218, 88).withFormatting(true, false, false, false, false).withShowTextHover(
            Chat.createTextBuilder().append([...str, '', 'Click to copy'].join('\n')).build()
        ).withClickEvent(`copy_to_clipboard`, str.join('\n'))
    )
}

function roundnear(arr, num) {
  return arr.reduce((prev, curr) => 
    Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev
  );
}

function rounddownarr(num, allowed) {
  if (num < allowed[0]) return allowed[0];
  
  for (let i = allowed.length - 1; i >= 0; i--) {
    if (num >= allowed[i]) return allowed[i];
  }
}

function smol(num) {
    if (num<10000) return num.toFixed(0)
    if (num>10000&&num<1000000) return Number((num/1000).toFixed(1))+"K"
    if (num>1000000) return Number((num/1000000).toFixed(1))+"M"
}

module.exports = { CWar }