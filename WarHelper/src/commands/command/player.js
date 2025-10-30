const { WynGET, Utility } = require('../../functions.js')
const guild = require('./guild.js')

const rankColors = {
    "VIP": [75, 148, 18],
    "VIP+": [75, 138, 248],
    "HERO": [214, 84, 202],
    "HERO+": [209, 67, 138],
    "CHAMPION": [241, 241, 51]
}

module.exports = (name) => player(name)


function player(name) {
    if (!name.match(/(?:(?:^[a-zA-Z_0-9]{3,16}$)|(?:^[0-9a-z-]{36}$))/g)) {
        Chat.log(Chat.createTextBuilder()
            .append(`[PlayerLookup]`).withColor(59, 158, 45)
            .append(` Invalid name`)
            .append(` "${name}"`).withColor(15, 90, 128)
        )
        return
    }
    Chat.log(Chat.createTextBuilder()
        .append(`[PlayerLookup]`).withColor(59, 158, 45)
        .append(` Searching for player:`)
        .append(` "${name}"`).withColor(15, 90, 128)
    )

    // WynGET(`/player/${name}?fullResult`)
    const st_time = new Date()
    const response = WynGET(`/player/${name}?fullResult`)
    // Chat.log(response.responseCode)

    if (response.responseCode == 200) {
        const r = JSON.parse(response.text())
        const ageHeader = response?.headers?.Age ?? []

        const rank = (r.shortenedRank?.toUpperCase() ?? r.supportRank?.toUpperCase() ?? '').replace(/PLUS$/g, '+')
        const msg = Chat.createTextBuilder()
            .append(`[PlayerLookup] `).withColor(59, 158, 45).withShowTextHover(Chat.createTextBuilder()
                .append(`Request Details:\n`).withColor(91, 81, 168)
                .append(`- Latency:`).withColor(76, 120, 210).append(` ${new Date() - st_time}ms\n`)
                .append('- Last Update:').withColor(76, 120, 210).append(` ${Utility.Date.relative((ageHeader[0] ?? 0) * 1000, 'hms', true)} ago\n`)
                .append(`- Next Update:`).withColor(76, 120, 210).append(` in ${Utility.Date.relative(new Date(response.headers.expires[0]) - new Date(), 'hms', true)}`)
                .build()
            )
            .append(rank ? `(` : '')
            .append(rank ? `${rank}` : '').withColor(...rankColors[rank] ?? [79, 135, 49])
            .append(rank ? `) ` : '')
            .append(`${r.username}\n`).withColor(237, 164, 68).withFormatting(true, false, false, false, false)

            .withShowTextHover(Chat.createTextBuilder()
                .append(`UUID: ${r.uuid}\n\nClick to copy`)
                .build()
            )
            .withClickEvent(`copy_to_clipboard`, r.uuid)
        if (r.restrictions.mainAccess) {
            msg.append('- MainAccess ').append('-Restricted-\n').withColor(228, 8, 10)
        } else msg.append('- Joined ').append(`${Utility.Date.relative(new Date(r.firstJoin), 'ydhm')}`).withColor(93, 226, 231).append(' ago\n')

        if (r.restrictions.onlineStatus) {
            msg.append('- OnlineStatus ').append('-Restricted-').withColor(228, 8, 10)
        } else if (r.online) {
            msg.append(`- Currently `)
                .append('online').withColor(125, 218, 88).append(' on ')
                .append(`${r.server ?? 'Null'}`).withColor(125, 218, 88)
            if (r.characters) if (r.activeCharacter && r.characters[r.activeCharacter]) {
                msg.append(' (').append(r.characters[r.activeCharacter].type.slice(0, 3)).withColor(32, 170, 175).withFormatting(true, false, false, false, false)
                    .withShowTextHover(Chat.createTextBuilder()
                        .append(`${r.characters[r.activeCharacter]?.reskin ?? r.characters[r.activeCharacter]?.type} ${r.characters[r.activeCharacter].nickname ? `(${r.characters[r.activeCharacter].nickname})` : ''}`).withColor(237, 164, 68)
                        .append(`\n\nTotalLevel: `).withColor(255, 235, 158).append(r.characters[r.activeCharacter]?.totalLevel).append(` (${r.characters[r.activeCharacter]?.level})`)
                        .append(`\nPlaytime: `).withColor(255, 235, 158).append(r.characters[r.activeCharacter]?.playtime + 'h')
                        .append('\nWars: ').withColor(255, 235, 158).append(r.characters[r.activeCharacter]?.wars)
                        .append('\nGamemodes: ').withColor(255, 235, 158).append(r.characters[r.activeCharacter]?.gamemode.length ? '\n - ' + r.characters[r.activeCharacter]?.gamemode.join('\n - ') : 'None')
                        .build()
                    )
                    .append(')')
            }
        } else msg.append(`- Currently `).append('offline').withColor(228, 8, 10).append(' - ')
            .append(`${Utility.Date.relative(new Date(r.lastJoin), 'ydhms')}`).withColor(228, 8, 10).append(' ago on ').append(`${r.server ?? 'Null'}`).withColor(125, 218, 88)


        if (r.restrictions.mainAccess) {
            msg.append('\n- Playtime: ').append('-Restricted-').withColor(228, 8, 10)
        } else {
            const featured = r.featuredStats ? Object.entries(r.featuredStats).map(ent => `> ${ent[0]}: ${ent[1]}`).join('\n') : `None`
            msg.append('\n- Playtime: ').append(`${r.playtime ?? 0}h - `).withColor(93, 226, 231)
                .append('Stats').withFormatting(true, false, false, false, false).withColor(32, 170, 175).withShowTextHover(Chat.createTextBuilder()
                    .append(`Username: `).withColor(237, 164, 68).append(r.username)
                    .append(`\n\nPlaytime: `).withColor(255, 235, 158).append((r.playtime ?? 'N/A') + 'h')
                    .append('\nLevel: ').withColor(255, 235, 158).append(r.globalData?.totalLevel ?? 'N/A')
                    .append('\nWars: ').withColor(255, 235, 158).append(r.globalData?.wars ?? 'N/A')
                    .append('\nRaids: ').withColor(255, 235, 158).append(r.globalData?.raids?.total ?? 'N/A')
                    .append('\nDungeons: ').withColor(255, 235, 158).append(r.globalData?.dungeons?.total ?? 'N/A')
                    .append('\nLootruns: ').withColor(255, 235, 158).append(r.globalData?.lootruns ?? 'N/A')
                    .append(`\n\nFeatured: \n`).withColor(237, 164, 68).append(featured)
                    .build()
                )
        }

        msg.append('\n- Guild: ')
        if (r.guild) {
            msg.append(r.guild.name).withColor(93, 226, 231)
                .append(' [').append(r.guild.prefix).withColor(93, 226, 231).append(']').append(' (').append(r.guild.rank.toUpperCase()).withColor(70, 195, 200).append(') ')
                .append('View').withFormatting(true, false, false, false, false).withColor(32, 170, 175).withShowTextHover(Chat.createTextBuilder()
                    .append(`Click to view ${r.guild.name}`)
                    .build()
                ).withCustomClickEvent(JavaWrapper.methodToJavaAsync(() => {
                    guild(r.guild.name)
                }))
        } else msg.append('Guildless').withColor(89, 90, 90)
        Chat.log(msg)
    } else {
        if (response.responseCode == 300) {
            const r = JSON.parse(response.text())
            const msg = Chat.createTextBuilder()
                .append(`[PlayerLookup] `).withColor(59, 158, 45).append('Multiple Users exist with this username, Please select')
            for (const user of Object.entries(r.objects)) {
                msg.append('\n-> ')
                if (user[1].supportRank) {
                    const rank = user[1].supportRank.toUpperCase().replace(/PLUS$/g, '+')
                    msg.append('(').append(rank).withColor(...rankColors[rank] ?? [79, 135, 49]).append(') ')
                }
                msg.append(user[1].username).withColor(237, 164, 68).withFormatting(true, false, false, false, false)

                    .withShowTextHover(Chat.createTextBuilder()
                        .append(`UUID: ${user[0]}\n\nClick to view`)
                        .build()
                    ).withCustomClickEvent(JavaWrapper.methodToJavaAsync(() => {
                        player(user[0])
                    }))
            }
            Chat.log(msg)
        } else {
            Chat.log(
                Chat.createTextBuilder()
                    .append(`[PlayerLookup] `).withColor(59, 158, 45)
                    .append('Error').withShowTextHover(
                        Chat.createTextBuilder().append(response.error).build()
                    ).withFormatting(true, false, false, false, false).withColor(228, 8, 10)
                    .append(` Could not fetch player`)
                    .append(` "${name}"`).withColor(15, 90, 128)
                    .append(`, Did you type it correctly? `)
            )
        }
    }
}