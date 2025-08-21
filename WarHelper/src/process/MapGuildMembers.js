let obj = {}

module.exports = evt => {
    const screen = evt.screen
    const screenName = screen.getTitleText()?.getString()
    if (screenName.startsWith("Black Fangs: Members")) {
       for (item of evt.inventory.getItems().filter(ent=>ent.getDefaultName().toString().includes("Player Head"))) {
            obj[item.getName().withoutFormatting().getString()] = {
                "xp": Number(item.getLore()[2].withoutFormatting().getString().split(": ")[1].replace(/,/g, "")),
                "info": item.getLore()[5].withoutFormatting().getString().slice(2),
                "streak": item.getLore()[5].withoutFormatting().getString().includes("Waiting for player to join")? Number(item.getLore()[7].withoutFormatting().getString().slice(2).split(": ")[1]):Number(item.getLore()[6].withoutFormatting().getString().slice(2).split(": ")[1])
            }
        }
        screen.setOnClose(JavaWrapper.methodToJava(() => {
            Chat.log(
                Chat.createTextBuilder()
                .append(`Mapped ${Object.values(obj).length} members, Click `)
                .append(`Here`).withFormatting(true, false, false, false, false).withColor(84, 206, 133).withClickEvent(`copy_to_clipboard`, JSON.stringify(obj, null, 2))
                .append(` to copy`)
            )
            obj = {}
        }));
    }
}