const {WynGET, timer} = require('../../functions.js')

module.exports = name=> {
    const response = WynGET((name.length<=4)? `/guild/prefix/${name}`: `/guild/${name}`)
    // Chat.log(response.responseCode)
    if (response.responseCode==200) {
        const r = JSON.parse(response.text())

        // const checkCD = time => (new Date()-new Date(time))<604800000
        const msg = Chat.createTextBuilder()
            .append(`[GuildLookup] `).withColor(59, 158, 45)
            .append(`${r.name} [${r.prefix}] (Lv. ${r.level})`).withColor(91, 81, 168)
            .append(` has `)
            .append(`${r.online}/${r.members.total}`).withColor(91, 81, 168)
            .append(` online`)
        for (const rank of ['owner', 'chief', 'strategist', 'captain', 'recruiter', 'recruit']) { //kys
            const online = Object.entries(r.members[rank]).filter(ent=>ent[1].online)
            if (online.length) {
                msg.append(`\n${rank.toUpperCase()} (${online.length}):\n`).withColor(76, 120, 210)
                // online.map(ent=>`${ent[0]} [${ent[1].server}] ${checkCD(ent[1].joined)? `(CD)`: ''}`)
                online.forEach(ent=>{
                    msg.append(`${ent[0]}, `)
                    .withShowTextHover(Chat.createTextBuilder()
                        .append(`Server: ${ent[1].server}\nJoined: ${timer(ent[1].joined)} ago\n\nClick to message`)
                        .build()
                    )
                    .withClickEvent(`suggest_command`, `/msg ${ent[0]} `)
                })
            }
        }
        
        Chat.log(msg)
    } else if (response.error) {
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