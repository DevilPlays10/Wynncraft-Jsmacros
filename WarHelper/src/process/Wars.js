let currentWar;

const {getTerData, getMapHQS, getExternals, getMapDef} = require('./Territories.js')
const {CWar:sendwar} = require('./Eco')

// Chat.log(getTerData('Ancient Excavation'))
// Chat.log(getExternals('Ancient Excavation'))
// // Chat.log(getMapHQS())

const queued = {}

function queue(ter) {
    queued[ter] = {
        hq: getMapHQS().includes(ter),
        ext: getExternals(ter).length,
        data: getTerData(ter),
        mapdef: getMapDef(ter)
    }
}

function War(data) {
    if (!currentWar) {
        const ter = queued[data[2]]? queued[data[2]].data: getTerData(data[2])
        const hq = queued[data[2]]? queued[data[2]].hq : getMapHQS().includes(data[2])
        currentWar={
            Cons: ter?.cons??0,
            Guild: data[1],
            Territory: data[2],
            StartHP: data[3],
            defence: data[4],
            StartDMG: data[5],
            attack: data[6],
            time: new Date().getTime(),
            endtime: new Date().getTime(),
            EndHP: data[3],
            EndDMG: data[5],
            HQ: hq,
            externals: hq? queued[data[2]]? queued[data[2]].ext : getExternals(data[2]).length: null,
            mapdef: queued[data[2]]?.mapdef? queued[data[2]].mapdef : getMapDef(data[2])
        }
        if (queued[data[2]]) delete queued[data[2]]
    } else {
        currentWar.endtime = new Date().getTime(),
        currentWar.EndHP = data[3],
        currentWar.EndDMG = data[5],
        currentWar.duration = currentWar.endtime-currentWar.time
    }
}

let lastevt;
const sounds = ["minecraft:entity.ender_dragon.growl", "minecraft:entity.blaze.ambient"]
function markBonus(data) {
    if (!currentWar) return
    if (lastevt) {
        if (data===sounds[1]) {
            if (!currentWar.aura) currentWar.aura=(new Date()/1000).toFixed()-currentWar.time
            currentWar.aura++
            lastevt=null
        } else if ((new Date() - lastevt.time)>100) {
            if (!currentWar.volley) currentWar.volley=(new Date()/1000).toFixed()-currentWar.time
            currentWar.volley++
            lastevt=null
        }
    }
    if (data===sounds[0]) lastevt = {data, time: new Date()}
}

setInterval(() => {
    if ((new Date()/1000-currentWar?.endtime)>100) {
        sendwar(currentWar)
        currentWar=null
    }
}, (1000));

function setInterval(wrapped, timeout) {
    let cancel = {"cancelled": false}
    JavaWrapper.methodToJavaAsync(() => {
        while (!cancel.cancelled) {
            Time.sleep(timeout);
            wrapped();
        }
    }).run();
    return cancel;
}

function Finish(territory) {
    if (!currentWar) {
        // Chat.log("not in a war")
        return
    }
    if (currentWar.Territory==territory) {
        sendwar(currentWar)
        currentWar = null
    }
}

function finishforce() {
    if (!currentWar) return
    sendwar(currentWar)
    currentWar = null
}

module.exports = { War, Finish, markBonus, queue, finishforce}