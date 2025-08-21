const MapGMembers = require('./process/MapGuildMembers.js')
const {War, Finish, markBonus, queue, finishforce} = require('./process/Wars.js')

const {conf} = JSON.parse((FS.open('../storage/config.json', 'utf-8')).read())
JsMacros.on("ContainerUpdate", JavaWrapper.methodToJava((evt) => {
    if (conf.MapMembersEnabled) MapGMembers(evt)
}))

// simulate("[DEU] Herb Cave Tower - ❤ 974999 (62.5%) - ☠ 2340-3509 (0.75x)")
// function simulate(msg) {
//     Chat.log(msg)
//     const match = msg.matchAll(/\[(\w{1,4})\] ([\w' ]+) Tower - ❤ (\d+) \((\d{2}.\d%)\) - ☠ (\d+-\d+) \((\d\.\d{1,2}x)\)/g)
//     for (const m of match) War(m)
//     Time.sleep(1000)
//     finishforce()
// }

JsMacros.on("Bossbar", JavaWrapper.methodToJava((evt) => {
    const name = evt.bossBar?.getName().toJson()
    if (!name) return
    const name_ = (name?.text? name.text: name).replace(/Â§/g, "§").replace(/§./g, "").replace(/[â¤˜"\\]/g, '')
    const match = name_.matchAll(/\[(\w{1,4})\] ([\w' ]+) Tower - ❤ (\d+) \((\d{2}.\d%)\) - ☠ (\d+-\d+) \((\d\.\d{1,2}x)\)/g)
    for (const m of match) if (conf.LogWarsEnabled) War(m)
}))

JsMacros.on("RecvMessage", JavaWrapper.methodToJava((evt) => {
    const txt = evt.text.getString()
    if (!txt) return
    if (txt.match(/(?<=You have taken control of )(.+?)(?= from \[)/)) Finish(txt.match(/(?<=You have taken control of )(.+?)(?= from \[)/)[0])
    if (txt.match(/(?<=The war for )(.+?)(?= will start in)/)&&txt.endsWith(" minutes.")) queue(txt.match(/(?<=The war for )(.+?)(?= will start in)/)[0])
    if (txt.startsWith("You have died at ")) finishforce()
  })
);

JsMacros.on("Sound", JavaWrapper.methodToJava((evt) => {
    markBonus(evt.sound.toString())
    // // Chat.log(evt)
    // const str = `${evt.sound.toString()} - pitch: ${evt.pitch.toString()} - vol: ${evt.volume.toString()}`
    //         let File = FS.open(`../storage/test/${current_date}Sound.txt`)
    //     //Chat.log(main)
    //     File.append(JSON.stringify(str)+'\n\n');
}))

JsMacros.on("DimensionChange", JavaWrapper.methodToJava((evt) => {
    finishforce()
}))

// JsMacros.on("Death", JavaWrapper.methodToJava((evt) => {
//     // finishforce()
//     Chat.log(evt)
// })) //fuck you wynncraft