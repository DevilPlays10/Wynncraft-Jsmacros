const MapGMembers = require('./process/MapGuildMembers.js')
const {War, Finish, markBonus, queue} = require('./process/Wars.js')

JsMacros.on("ContainerUpdate", JavaWrapper.methodToJava((evt) => {
    MapGMembers(evt)
}))


JsMacros.on("Bossbar", JavaWrapper.methodToJava((evt) => {
    const name = evt.bossBar?.getName().toJson()
    if (!name) return
    const name_ = (name?.text? name.text: name).replace(/Â§/g, "§").replace(/§./g, "").replace(/[â¤˜]/g, '')
    const match = name_.matchAll(/\[(\w{1,4})\] ([\w ]+) Tower - ❤ (\d+) \((\d{2}.\d%)\) - ☠ (\d+-\d+) \((\d\.\dx)\)/g)
    for (const m of match) War(m)
}))

const current_date = new Date().getTime()
FS.createFile(`../storage/test`, `${current_date}.txt`)
FS.createFile(`../storage/test`, `${current_date}Sound.txt`)

JsMacros.on("RecvMessage", JavaWrapper.methodToJava((evt) => {
    const txt = evt.text.getString()
    if (!txt) return
    if (txt.match(/(?<=You have taken control of )(.+?)(?= from \[)/)) Finish(txt.match(/(?<=You have taken control of )(.+?)(?= from \[)/)[0])
    if (txt.match(/(?<=The war for )(.+?)(?= will start in)/)&&txt.endsWith(" minutes.")) queue(txt.match(/(?<=The war for )(.+?)(?= will start in)/)[0])
    
        let File = FS.open(`../storage/test/${current_date}.txt`)
        //Chat.log(main)
        File.append(JSON.stringify(txt)+'\n\n');
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