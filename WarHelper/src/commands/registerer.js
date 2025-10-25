
const player_guildCMD = require('./command/player_guild') //these 2 are in same becozx they call eachother
const { getGuildsSync } = require('../process/ext/Guilds')

const { conf } = JSON.parse((FS.open('../storage/config.json', 'utf-8')).read())

const commands = [
    conf.guildCommandEnabled ? Chat.createCommandBuilder(conf.guildCommandName).greedyStringArg('name').executes(JavaWrapper.methodToJavaAsync((ent) => {
        const name = ent.getArg('name')
        player_guildCMD.guild(name) //idk how to use await with this and return true within 300ms so this works of rnow
        return true
    })).suggestMatching(getGuildsSync()?.flat(1) ?? []) : null,
    conf.playerCommandEnabled ? Chat.createCommandBuilder(conf.playerCommandName).greedyStringArg('name').executes(JavaWrapper.methodToJavaAsync((ent) => {
        const name = ent.getArg('name')
        player_guildCMD.player(name) //idk how to use await with this and return true within 300ms so this works of rnow
        return true
    })) : null
]

commands.filter(ent => ent).forEach(ent => ent.register())
event.stopListener = JavaWrapper.methodToJava(() => {
    commands.forEach(ent => ent.unregister())
});