let currentWar;

const {getTerData, getMapHQS, getExternals} = require('./Territories.js')

Chat.log(getTerData('Ancient Excavation'))
Chat.log(getExternals('Ancient Excavation'))
// Chat.log(getMapHQS())

function queue(ter) {
    Chat.log(ter)
}

function War(data) {
    if (!currentWar) {
        const ter = getTerData(data[2])
        const hq = getMapHQS().includes(data[2])
        currentWar={
            Cons: ter?.cons??0,
            Guild: data[1],
            Territory: data[2],
            StartHP: data[3],
            defence: data[4],
            StartDMG: data[5],
            attack: data[6],
            time: (new Date()/1000).toFixed(),
            endtime: (new Date()/1000).toFixed(),
            EndHP: data[3],
            EndDMG: data[5],
            HQ: hq,
            externals: hq? getExternals(data[2]): null,
            aura: 0,
            volley: 0,
        }
    } else {
        currentWar.endtime = (new Date()/1000).toFixed()
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
            currentWar.aura++
            Chat.log('Aura')
            lastevt=null
        } else if ((new Date() - lastevt.time)>100) {
            currentWar.volley++
            Chat.log("Volley")
            lastevt=null
        }
    }
    if (data===sounds[0]) lastevt = {data, time: new Date()}
}

setInterval(() => {
    if ((new Date()/1000-currentWar?.endtime)>100) {
        Chat.log(`marked war ${currentWar.Territory} as finished`)
        Chat.log(currentWar)
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
    if (!currentWar) return
    if (currentWar.Territory==territory) {
        Chat.log(`marked war ${currentWar.Territory} as finished instant`)
        Chat.log(currentWar)
        currentWar = null
    }
}

module.exports = { War, Finish, markBonus, queue}