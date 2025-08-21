
const stdate = new Date().getTime()

require('./commands/registerer')
require('./eventrouters.js')

function pushToLogs(file, msg) {
    FS.makeDir(`../storage/Logs`)
    FS.makeDir(`../storage/Logs/${stdate}`,)
    const File = FS.open(`../storage/Logs/${stdate}/${file}`)
    File.append(`${JSON.stringify(msg)},\n`)
}

//made by devivel ofc, cant forget this

module.exports = { pushToLogs }