const { WynGET, Utility } = require('../../functions.js')
const { getGuildsSync } = require('../../process/ext/Guilds')

module.exports = (name) => {
    if (name.match(/[^a-zA-Z ]/g)) {
        Chat.log(Chat.createTextBuilder()
            .append(`[GuildLookup]`).withColor(59, 158, 45)
            .append(` Invalid name`)
            .append(` "${name}"`).withColor(15, 90, 128)
        )
        return true
    }

    Chat.log(Chat.createTextBuilder()
        .append(`[GuildLookup]`).withColor(59, 158, 45)
        .append(` Searching for guild:`)
        .append(` "${name}"`).withColor(15, 90, 128)
    )

    if (name.length <= 4) {
        const gsync = getGuildsSync()
        if (!gsync.map(ent => ent[1]).includes(name)) {
            const filter = gsync.filter(ent => ent[1].toLowerCase() == name.toLowerCase()).map(ent => ent[1])
            if (filter[0]) name = filter[0]
        }
    }

    const st_time = new Date()
    const response = WynGET((name.length <= 4) ? `/guild/prefix/${name}` : `/guild/${name}`)
    // Chat.log(response.responseCode)




    if (response.responseCode == 200) {
        const r = JSON.parse(response.text())
        const ageHeader = response?.headers?.Age??[]

        // const checkCD = time => (new Date()-new Date(time))<604800000
        const msg = Chat.createTextBuilder()
            .append(`[GuildLookup] `).withColor(59, 158, 45).withShowTextHover(Chat.createTextBuilder()
                .append(`Request Details:\n`).withColor(91, 81, 168)
                .append(`- Latency:`).withColor(76, 120, 210).append(` ${new Date()-st_time}ms\n`)
                .append('- Last Update:').withColor(76, 120, 210).append(` ${Utility.Date.relative((ageHeader[0]??0)*1000, 'hms', true)} ago\n`)
                .append(`- Next Update:`).withColor(76, 120, 210).append(` in ${Utility.Date.relative(new Date(response.headers.expires[0])-new Date(), 'hms', true)}`)
                .build()
            )
            .append(`${r.name} [${r.prefix}] (Lv. ${r.level})`).withColor(91, 81, 168).withShowTextHover(Chat.createTextBuilder()
                .append(`Guild Details:\n`).withColor(91, 81, 168)
                .append(`- Owner:`).withColor(76, 120, 210).append(` ${Object.getOwnPropertyNames(r.members.owner)[0]}\n`)
                .append(`- Created:`).withColor(76, 120, 210).append(` ${Utility.Date.relative(new Date(r.created), 'ydhm')} ago\n`)
                .append(`- Wars:`).withColor(76, 120, 210).append(` ${r.wars}\n`)
                .append('- Territories:').withColor(76, 120, 210).append(` ${r.territories}`)
                .build()
            )
            .append(` has `)
            .append(`${r.online}/${r.members.total}`).withColor(91, 81, 168)
            .append(` online`)
        for (const rank of ['owner', 'chief', 'strategist', 'captain', 'recruiter', 'recruit']) {
            const online = Object.entries(r.members[rank]).filter(ent => ent[1].online)
            if (online.length) {
                msg.append(`\n${rank.toUpperCase()} (${online.length}):\n`).withColor(76, 120, 210)
                online.forEach((ent, i) => {
                    msg.append(i + 1 == online.length ? `${ent[0]}` : `${ent[0]}, `)
                        .withShowTextHover(Chat.createTextBuilder()
                            .append(`Server: ${ent[1].server}\nJoined: ${Utility.Date.relative(new Date(ent[1].joined), 'ydhm')} ago\n\nClick to message`)
                            .build()
                        )
                        // .withCustomClickEvent(JavaWrapper.methodToJava(() => {
                        //     Chat.log("ee")
                        //     // player(ent[1].uuid)
                        // }))
                        .withClickEvent(`suggest_command`, `/msg ${ent[0]} `)
                })
            }
        }

        Chat.log(msg)
    } else {
        Chat.log(
            Chat.createTextBuilder()
                .append(`[GuildLookup] `).withColor(59, 158, 45)
                .append('Error').withShowTextHover(
                    Chat.createTextBuilder().append(response.error).build()
                ).withFormatting(true, false, false, false, false).withColor(228, 8, 10)
                .append(` Could not fetch guild`)
                .append(` "${name}"`).withColor(15, 90, 128)
                .append(`, Did you type it correctly? `)
        )
    }
} 