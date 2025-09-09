const [aura, volley] = [[0, 24, 18, 12], [0, 20, 15, 10]]
const upgrades = {
    attack: [0.5, 0.75, 1, 1.25, 1.6, 2, 2.5, 3, 3.6, 3.8, 4.2, 4.7],
    defence: [10, 40, 55, 62.5, 70, 75, 79, 82, 84, 86, 88, 90],
    damage: [ 1000, 1400, 1800, 2200, 2600, 3000, 3400, 3800, 4200, 4600, 5000, 5400 ],
    health: [ 300000, 450000, 600000, 750000, 960000, 1200000, 1500000, 1860000, 2220000, 2580000, 2940000, 3300000]
}

const c = {
    none: [252, 252, 252],
    text: [93, 226, 231],
    num: [204, 108, 231],
    textRes: [254, 153, 0],
    num2: [129, 38, 155],
    spec: [57, 150, 153],
    defs: {
        "Very Low": [72, 140, 63],
        "Low": [126, 255, 109],
        "Medium": [255, 238, 126],
        "High": [255, 85, 85],
        "Very High": [191, 0, 0]
    }
}

const defCalc = {
    normal: {
        "Very Low": [0, 5],
        "Low": [6, 18],
        "Medium": [19, 30],
        "High": [31, 48],
        "Very High": [49, Infinity]
    },
    hq: {
        "Low": [0, 5],
        "Medium": [6, 18],
        "High": [19, 30],
        "Very High": [31, Infinity],
    }
}

const {pushToLogs} = require('../main')

let sessionwar=0

class War {
    constructor(war) {
        // this.raw = war
        const [dmg, attack] = [war.StartDMG.split('-'), Number(war.attack.replace(/[x]/g, ''))]
        const endDmg = war.EndDMG.split('-')
        this.meta = {guild: war.Guild, cons: war.Cons, terr: war.Territory, externals: war.externals, multiplier: war.HQ? (1+(0.3*war.Cons))*(1+(0.5+0.25*(war.Cons+war.externals))): (1+(0.3*war.Cons))}
        this.tower = {
            base: {dmg: {min: dmg[0], max: dmg[1]}, attack, health: war.StartHP, defence: war.defence.replace(/[%]/g, '')},
            Sdps: [(dmg[0]*attack).toFixed(), (dmg[1]*attack).toFixed()],
            Sehp: Number(war.StartHP / (1-(war.defence.replace(/[%]/g, '')/100))).toFixed(1),
            Edps: [(endDmg[0]*attack).toFixed(), (endDmg[1]*attack).toFixed()],
            Eehp: Number(war.EndHP / (1-(war.defence.replace(/[%]/g, '')/100))).toFixed(1),
            EDmg: endDmg[0]+'-'+endDmg[1],
            EHP: war.EndHP //this is end hp NOT eeffeicenve hp, effive hp is SEHP or EEHP
        }
        this.warPDetails = {
            duration: war.duration??0,
            avgDPS: Number(((this.tower.Sehp-this.tower.Eehp)/war.duration).toFixed(0))??0,
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
        this.meta.eMultiplier=(Object.values(this.upgrades).reduce((a, c)=>a+c,0)) + (this.bonuses.aura? this.bonuses.aura+5:0) + (this.bonuses.volley? this.bonuses.volley+3:0)
        this.def = {
            MapDef: war.mapdef??'N/A',
            CalcDef: Object.entries(this.warPDetails.HQ? defCalc.hq:defCalc.normal).filter(ent=>{
                if (this.meta.eMultiplier>=ent[1][0]&&this.meta.eMultiplier<=ent[1][1]) return true
            })[0][0]??"N/A"
        }
    }
}

function CWar(war) {
    sessionwar++
    const bt = new War(war)
    pushToLogs('wars.log', {[`${bt.warPDetails.HQ? 'HQ War': 'War'} ${sessionwar}`]: bt})
    const str_ = [
        [
            [`${bt.warPDetails.HQ? `HQ War`: `War`}`, c.text],
            [` #${sessionwar}\n`, c.num]
        ],
        [
            ['Territory:', c.text],
            [` ${bt.meta.terr}`, c.textRes]
        ],
        [
            ['Guild:', c.text],
            [` ${bt.meta.guild}`, c.textRes]
        ],
        [
            [(bt.warPDetails.HQ? `Cons(Ext): `: `Cons: `), c.text],
            [(bt.warPDetails.HQ?`${bt.meta.cons}(${bt.meta.externals??0})`: bt.meta.cons), c.num]
        ],
        [
            [`Duration: `, c.text],
            [`${bt.warPDetails.duration}s`, c.num]
        ],
        [
            [`DPS: `, c.text],
            [`${smol(bt.warPDetails.avgDPS)}\n`, c.num]
        ],
        [
            [`InitialStats:\n`, c.textRes],
            [`- DMG: `, c.text],
            [`${bt.tower.base.dmg.min}-${bt.tower.base.dmg.max}`, c.num],
            [` (${smol(bt.tower.Sdps[0])}-${smol(bt.tower.Sdps[1])} DPS)\n`, c.num2],
            [`- ATK: `, c.text],
            [`${bt.tower.base.attack}`, c.num],
            [`x\n`, c.spec],
            [`- HP: `, c.text],
            [`${smol(bt.tower.base.health)}`, c.num],
            [` (${smol(bt.tower.Sehp)} EHP)\n`, c.num2],
            [`- DEF: `, c.text], 
            [`${bt.tower.base.defence}`, c.num],
            [`%\n`, c.spec],
        ],
        [
            [`FinalStats:\n`, c.textRes],
            [`- DMG: `, c.text],
            [`${bt.tower.EDmg}`, c.num],
            [` (${smol(bt.tower.Edps[0])}-${smol(bt.tower.Edps[1])} DPS)\n`, c.num2],
            [`- ATK: `, c.text],
            [`${bt.tower.base.attack}`, c.num],
            [`x\n`, c.spec],
            [`- HP: `, c.text],
            [`${smol(bt.tower.EHP)}`, c.num],
            [` (${smol(bt.tower.Eehp)} EHP)\n`, c.num2],
            [`- DEF: `, c.text], 
            [`${bt.tower.base.defence}`, c.num],
            [`%\n`, c.spec],
        ],
        [
            [`Eco:\n`, c.textRes],
            [`- WynnDef: `, c.text],
            [`${bt.def.MapDef}\n`, c.defs[bt.def.MapDef]??c.none],
            [`- CalcDef: `, c.text],
            [`${bt.def.CalcDef}\n`, c.defs[bt.def.CalcDef]??c.none],
            [`- Upgrades: `, c.text],
            [`${bt.upgrades.dmg}-${bt.upgrades.attack}-${bt.upgrades.health}-${bt.upgrades.defence}\n`, c.num],
            [`- Bonuses: `, c.text],
            [`0-0-${bt.bonuses.aura}-${bt.bonuses.volley}\n`, c.num]
        ],
        [
            [`Click to copy`, c.none]
        ]
    ]
    const strCOPY = [
        '```ex',
        `Territory: ${bt.meta.terr} ${bt.warPDetails.HQ? `(HQ)`: ''}`,
        `Guild: ${bt.meta.guild}`,
        `${bt.warPDetails.HQ? `Cons(Ext): ${bt.meta.cons}(${bt.meta.externals??0})`: `Cons: ${bt.meta.cons}`}`,
        `Duration: ${bt.warPDetails.duration}s`,
        `DPS: ${smol(bt.warPDetails.avgDPS)}`,
        ``,
        `InitialStats:`,
        `- DMG: ${bt.tower.base.dmg.min}-${bt.tower.base.dmg.max} (${smol(bt.tower.Sdps[0])}-${smol(bt.tower.Sdps[1])} DPS)`,
        `- ATK: ${bt.tower.base.attack}x`,
        `- HP: ${smol(bt.tower.base.health)} (${smol(bt.tower.Sehp)} EHP)`,
        `- DEF: ${bt.tower.base.defence}%`,
        ``,
        `FinalStats:`,
        `- DMG: ${bt.tower.EDmg} (${smol(bt.tower.Edps[0])}-${smol(bt.tower.Edps[1])} DPS)`,
        `- ATK: ${bt.tower.base.attack}x`,
        `- HP: ${smol(bt.tower.EHP)} (${smol(bt.tower.Eehp)} EHP)`,
        `- DEF: ${bt.tower.base.defence}%`,
        ``,
        `Eco:`,
        `- WynDef: ${bt.def.MapDef}`,
        `- CalcDef: ${bt.def.CalcDef}`,
        `- Upgrades: ${bt.upgrades.dmg}-${bt.upgrades.attack}-${bt.upgrades.health}-${bt.upgrades.defence}`,
        `- Bonuses: 0-0-${bt.bonuses.aura}-${bt.bonuses.volley}`,
        '```'
    ]
    const cbbuilderInsider = Chat.createTextBuilder()
    for (string of str_) {
        //stfu thso works and i wil not touch this
        if (str_.indexOf(string)!==0) cbbuilderInsider.append('\n')
        for (string2 of string) {
            if (!string2[1]) {
                cbbuilderInsider.append(string2[0])
            } else cbbuilderInsider.append(string2[0]).withColor(...string2[1])
        }
    }
    Chat.log(Chat.createTextBuilder()
        .append('[War] ').withColor(210, 1, 3)
        .append(`${bt.meta.terr} taken from `)
        .append(bt.meta.guild).withColor(106, 104, 186)
        .append(`\n- Time: ${bt.warPDetails.duration}s `)
        .append(`View More`).withColor(125, 218, 88).withFormatting(true, false, false, false, false).withShowTextHover(
            cbbuilderInsider.build()
        ).withClickEvent(`copy_to_clipboard`, strCOPY.join('\n'))
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
    if (num<10000) return Number(num)
    if (num>10000&&num<1000000) return Number((num/1000).toFixed(1))+"K"
    if (num>1000000) return Number((num/1000000).toFixed(1))+"M"
}

module.exports = { CWar }