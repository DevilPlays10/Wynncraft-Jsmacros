
const guild = require('./command/guild')
const player = require('./command/player')
const history = require('./command/history')


const { getGuildsSync } = require('../process/ext/Guilds')

const { conf } = JSON.parse((FS.open('../storage/config.json', 'utf-8')).read())

const commands = [
    conf.guildCommandEnabled ? Chat.createCommandBuilder(conf.guildCommandName).greedyStringArg('name').executes(JavaWrapper.methodToJavaAsync((ent) => {
        const name = ent.getArg('name')
        guild(name) //idk how to use await with this and return true within 300ms so this works of rnow
        return true
    })).suggestMatching(getGuildsSync()?.flat(1) ?? []) : null,
    conf.playerCommandEnabled ? Chat.createCommandBuilder(conf.playerCommandName).greedyStringArg('name').executes(JavaWrapper.methodToJavaAsync((ent) => {
        const name = ent.getArg('name')
        player(name)
        return true
    })) : null,
    conf.warHistoryCommandEnabled ? Chat.createCommandBuilder(conf.warHistoryCommandName).executes(JavaWrapper.methodToJavaAsync((ent) => {
        history.run()
        return true
    })) : null,
]

commands.filter(ent => ent).forEach(ent => ent.register())
event.stopListener = JavaWrapper.methodToJava(() => {
    commands.forEach(ent => ent.unregister())
});