const config = JSON.parse((FS.open('../storage/config.json', 'utf-8')).read())

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
        relative: (time, include, dura) => {
            const elapsedTime = dura? time: new Date() - time;
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

            return array.length ? array.join(' ') : '0s';
        }
    }
}

module.exports = { timer, WynGET, setInterval, config, Utility }