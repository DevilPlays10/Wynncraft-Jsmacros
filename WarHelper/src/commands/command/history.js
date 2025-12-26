
const { readLogsFile, Utility } = require('../../functions')
const {generateWarMessage} = require('../../process/Eco.js')

function run() {
    const listedWars = readLogsFile('wars.json')
    if (!listedWars) {
        Chat.log(Chat.createTextBuilder()
            .append(`[WarHistory]`).withColor(59, 158, 45)
            .append(` No wars done this session`)
        )
        return
    }

    const wars = (JSON.parse(listedWars)).list

    const warsChatMsg = Chat.createTextBuilder()
        .append(`[WarHistory]`).withColor(59, 158, 45)
        .append(` ${wars.length} wars`).withColor(93, 226, 231)
        .append(' done this session (Showing last 10)')
    Chat.log(warsChatMsg)

    for (const war of wars.slice(-10).reverse()) {
        const [ object, copy] = generateWarMessage(war)

        Chat.log(Chat.createTextBuilder()
            .append('- ')
            .append(`${Utility.Date.relative(war.warPDetails.time*1000, 'dhms', null, 2)} `).withColor(93, 226, 231)
            .append(`ago `)
            .append(`#${war.warCount} `).withColor(254, 153, 0)
            .append(`${war.meta.terr} ${war.warPDetails.HQ? `(HQ) `: ``}`)
            .append(`[${war.meta.guild}]`).withColor(106, 104, 186)
            .append(' ')
            .append(`View More`).withColor(125, 218, 88).withFormatting(true, false, false, false, false).withShowTextHover(
                object.build()
            ).withClickEvent(`copy_to_clipboard`, copy.join('\n'))
        )
    }
        

}

module.exports = { run }