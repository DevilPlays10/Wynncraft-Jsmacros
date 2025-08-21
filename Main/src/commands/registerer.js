const guildCMD = require('./command/guild.js')

const {conf} = JSON.parse((FS.open('../storage/config.json', 'utf-8')).read())

const commands = [
    conf.guildCommandEnabled? Chat.createCommandBuilder(conf.guildCommandName).greedyStringArg('name').executes(JavaWrapper.methodToJavaAsync((ent)=>{
        const name = ent.getArg('name')
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
        guildCMD(name) //idk how to use await with this and return true within 300ms so this works of rnow
        return true
    })): null
]

commands.filter(ent=>ent).forEach(ent=>ent.register())
event.stopListener = JavaWrapper.methodToJava(() => {
    commands.forEach(ent=>ent.unregister())
});