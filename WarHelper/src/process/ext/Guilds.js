const { WynGET } = require('../../functions')

getGuilds()
async function getGuilds() {
    const res = await WynGET("/guild/list/guild")

    if (res.responseCode!==200) return
    const File = FS.open(`../storage/ext/guilds.json`)
    File.write(JSON.stringify(Object.entries(JSON.parse(res.text())).map(ent=>{return [ent[0].trim(), ent[1].prefix.trim()]})))
}

function getGuildsSync() {
    return JSON.parse((FS.open('../storage/ext/guilds.json', 'utf-8')).read())
}

module.exports = { getGuildsSync }

// /guild/list/guild