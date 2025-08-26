const {isFFA} = require('./Territories.js')

const defs = {
    "very low": ["very low"],
    "low": ["low", "very low"],
    "medium": ["medium", "low", "very low"],
    "high": ["high", "medium", "low", "very low"],
    "very high": ["very high", "high", "medium", "low", "very low"]
}

function warmenu(e, conf) {
    const name = e.screen?.getTitleText()?.getString()
    if (!name.startsWith('Attacking: ')) return
    Time.sleep(250)
    const slot = e.inventory.getSlot(13).getLore()
    if (!slot[0]) return
    if (slot[0]?.getString().includes('Calculating route')) return
    const defence = (slot[0].getString().split(':')[1]).match(/very low|low|medium|high|very high/gi)[0].toLowerCase()
    const cost_ = (slot[slot.length-2]).getString().match(/(\d+)$/g)
    if (!cost_) return
    const cost = cost_[0]
    // ter name determination
    let terr;
    const terr_ = slot[slot.length-4].getString().match(/(?<=✔ §f)(.*)(?=§7 )/g, '')
    // Chat.log(cost)
    if (!terr_) {
        // Chat.log("e")
        terr=slot[slot.length-4].getString().match(/(?<=§7).*/g, '')[0]
        // Chat.log(terr)
    } else terr = terr_[0]
    if (!terr) return
    // Chat.log(terr)
    // Chat.log(isFFA(terr))
    //autostart
    if (Object.getOwnPropertyNames(defs).includes(conf.AutoStartWarOnMenuDefence.toLowerCase()) &&defs[conf.AutoStartWarOnMenuDefence.toLowerCase()].includes(defence) &&conf.AutoStartWarOnMenuAcceptablePrice>=cost) {
        if (conf.AutoStartWarOnFFA_ONLY&&!isFFA(terr)) return 
        e.inventory.click(13)
        Chat.log(Chat.createTextBuilder()
            .append('[War] ').withColor(210, 1, 3)
            .append(`Queued ${isFFA(terr)? `FFA `: ''}as ${defence} with ${cost} emeralds`)
        )
    }
}

module.exports = { warmenu }