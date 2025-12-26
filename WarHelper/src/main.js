
const data = {
    startDate: Number((new Date()/1000).toFixed())
}

processInfoUpdate()

require('./commands/registerer')
require('./eventrouters.js')

function processInfoUpdate() {
    const File = FS.open(`../storage/processInfo.json`)
    File.write(JSON.stringify(data, null, 1))
}

// wow so empty
//made by devivel ofc, cant forget thi