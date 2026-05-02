// This script logs all the members from the guild member management page when you open them into a parseable format
// After going thru the pages and closing the screen, a message appears in the chat to copy the members list
// the result is a JSON object as
// Name: { xp: Number, info: Str, streak: int }

const guildName = "Black Fangs"
let obj = {}
let isActive = false
let closeHandlerSet = false

function onClose() {
    if (!isActive) return
    Chat.log(
        Chat.createTextBuilder()
            .append(`Mapped ${Object.values(obj).length} members, Click `)
            .append(`Here`)
                .withFormatting(true, false, false, false, false)
                .withColor(84, 206, 133)
                .withClickEvent(`copy_to_clipboard`, JSON.stringify(obj, null, 2))
            .append(` to copy`)
    )
    obj = {}
    isActive = false
    closeHandlerSet = false
}

JsMacros.on("OpenScreen", true, JavaWrapper.methodToJava((evt) => {
    const screenName = evt.screen?.getTitleText()?.getString()
    if (screenName?.startsWith(`${guildName}: Members`)) {
        isActive = true
        if (!closeHandlerSet) {
            closeHandlerSet = true
            evt.screen.setOnClose(JavaWrapper.methodToJava(() => onClose()))
        }
    } else {
        onClose() // if screeb cgabfes to soemthing else mark the prev screen as closed
    }
}))

JsMacros.on("SlotUpdate", true, JavaWrapper.methodToJava((evt) => {
    if (!isActive) return
    if (evt.slot === -999) return

    const item = evt.newStack
    if (!item || !item.getDefaultName().toString().includes("Player Head")) return

    const lore = item.getLore()
    const isWaiting = lore[5].withoutFormatting().getString().includes("Waiting for player to join")

    obj[item.getName().withoutFormatting().getString()] = {
        xp:     Number(lore[2].withoutFormatting().getString().split(": ")[1].replace(/,/g, "")),
        info:   lore[5].withoutFormatting().getString().slice(2),
        streak: isWaiting
            ? Number(lore[7].withoutFormatting().getString().slice(2).split(": ")[1])
            : Number(lore[6].withoutFormatting().getString().slice(2).split(": ")[1])
    }
}))