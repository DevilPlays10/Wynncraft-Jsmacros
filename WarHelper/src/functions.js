const config = JSON.parse((FS.open('../storage/config.json', 'utf-8')).read())
const processInfo = JSON.parse((FS.open('../storage/processInfo.json', 'utf-8')).read())

function WynGET(path) {
    try {
        const request = Request.create(encodeURI(config.urls.wyn + path))
        if (config.tokens.wyn) request.addHeader('Authorization', `Bearer ${config.tokens.wyn}`)
        return request.get()
    } catch (e) {
        return { error: e }
    }
}

//old depricated,  use utility.date.relative
function timer(val) { //ungracefully stolen from cmds/admin/profile
    const elapsedTime = new Date() - new Date(val);
    const [days, hours, minutes] = [Math.floor(elapsedTime / (1000 * 60 * 60 * 24)), Math.floor((elapsedTime / (1000 * 60 * 60)) % 24), (elapsedTime / (1000 * 60)) % 60]
    return (`${days ? `${days}d` : `${hours ? `${hours.toFixed(0)}h` : `${minutes ? `${minutes.toFixed(0)}m` : `0m`}`}`}`).trim()
}

function writeToLogsFile(data, file) {
    if (!FS.exists(`../storage/Logs/${processInfo.startDate}`)) {
        FS.makeDir(`../storage/Logs`)
        FS.makeDir(`../storage/Logs/${processInfo.startDate}`,)
    }
    const File = FS.open(`../storage/Logs/${processInfo.startDate}/${file}`)
    File.write(JSON.stringify(data, null, 1))
}

function readLogsFile(file) {
    if (!FS.exists(`../storage/Logs/${processInfo.startDate}/${file}`)) return
    return (FS.open(`../storage/Logs/${processInfo.startDate}/${file}`)).read()
}

function setInterval(wrapped, timeout) {
    let cancel = { "cancelled": false }
    JavaWrapper.methodToJavaAsync(() => {
        while (!cancel.cancelled) {
            Time.sleep(timeout);
            wrapped();
        }
    }).run();
    return cancel;
}

const Utility = {
    Date: {
        relative: (time, include, dura, onlyFans) => {
            const elapsedTime = dura ? time : new Date() - new Date(time);
            let totalSeconds = Math.floor(elapsedTime / 1000);

            const units = {
                y: 31536000,
                d: 86400,
                h: 3600,
                m: 60,
                s: 1
            };

            const array = [];

            for (const [unit, value] of Object.entries(units)) {
                if (include.includes(unit)) {
                    const amount = Math.floor(totalSeconds / value);
                    if (amount > 0) array.push(`${amount}${unit}`);
                    totalSeconds -= amount * value;
                }
            }

            if (onlyFans) return array.slice(0, onlyFans).join(' ') ?? '0s'
            return array.length ? array.join(' ') : '0s';
        }
    }
}


module.exports = { timer, WynGET, setInterval, config, Utility, writeToLogsFile, readLogsFile }