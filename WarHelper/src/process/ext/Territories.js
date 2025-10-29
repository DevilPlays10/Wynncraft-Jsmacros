const { WynGET, setInterval } = require('../../functions')
const Map = JSON.parse((FS.open('../storage/territories/Consmap.json', 'utf-8')).read())
const Ffa = JSON.parse((FS.open('../storage/territories/Ffa.json', 'utf-8')).read())
const AdvancementFrame  = Java.type("net.minecraft.class_189")

let terrs;

//instantly update terr cache for a bit (until next update) using chat to account for insta queues
function forceFinishUpdate(terr, guild) {
    terrs[terr] = {...terrs[terr], guild: {prefix: guild}, acquired: new Date().toISOString()}
}

function updateTerritories() {
    const res = WynGET(`/guild/list/territory`)
    if (res.responseCode!==200) return
    terrs = JSON.parse(res.text())
}

function getRawData(name) {
    return terrs[name]
}

function getTerData(name) { //cons
    const data={cons: 0, name,}
    if (terrs[name]) {
        data.guild = terrs[name].guild.prefix
        for (route of Map[name]["Trading Routes"]) {
            if (terrs[route].guild.prefix==data.guild) data.cons++
        }
        return data
    }
    return null
}

function getMapDef(name) {
    const terr = Client.getMinecraft().method_1562().method_2869().method_53814().method_53693();
    const list = terr.stream().filter(e=>e.method_53647().comp_1913().get().method_811().method_54160().trim()==name).map(e=>e.method_53647().comp_1913().get().method_817().method_54160()).toList()
    for (ent of list[0].split('\n')) if (ent.split(':')[0].includes('Territory Defences')) return (ent.split(':')[1]).match(/very low|low|medium|high|very high/gi)[0]
    return null
}

// description = explode.method_53647().comp_1913().get().method_817(); //it is a Text so u neeed to method_54160 Text.getLiteralString()

function isFFA(terr) {
    return Object.values(Ffa).flat(1).includes(terr)
}

function getMapHQS() {
    const terr = Client.getMinecraft().method_1562().method_2869().method_53814().method_53693();
    const hq = terr.stream().filter(e => e.method_53647().comp_1913().get().method_815() == AdvancementFrame.field_1250).map(e=>e.method_53647().comp_1913().get().method_811().method_54160()).toList()
    return [...new Set(hq.map(ent=>ent.trim()))]
}

function getExternals(terr) { //obnky reutnsrs owned extenrlas
    if (!terrs[terr]) return []
    const guild = terrs[terr].guild.prefix
    const ext = []
    for (const cons of Map[terr]["Trading Routes"]) for (ext_ of Map[cons]["Trading Routes"]) ext.push(...Map[ext_]["Trading Routes"], ext_)
    //Chat.log(ext) //stfu thsi works
    return [...new Set(ext.filter(ent=>terrs[ent].guild.prefix == guild&&terr!==ent))]
}

updateTerritories()
setInterval(() => {
    updateTerritories()
}, 1000*10);

module.exports = { getTerData, getMapHQS, getExternals, getMapDef, isFFA, getRawData, forceFinishUpdate }