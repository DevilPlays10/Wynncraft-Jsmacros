const config = JSON.parse((FS.open('../storage/config.json', 'utf-8')).read())

function WynGET(path) {
    try {
        const request = Request.create(encodeURI(config.urls.wyn+path))
        if (config.tokens.wyn) request.addHeader('Authorization', `Bearer ${config.tokens.wyn}`)
            return request.get()
    } catch(e) {
        return {error: e}
    }
}

function timer(val) { //ungracefully stolen from cmds/admin/profile
  const elapsedTime = new Date() - new Date(val);
  const [days, hours, minutes] = [Math.floor(elapsedTime/(1000*60*60*24)), Math.floor((elapsedTime/(1000*60*60))%24), (elapsedTime/(1000*60))%60]
  return (`${days? `${days}d`: `${hours? `${hours.toFixed(0)}h`: `${minutes? `${minutes.toFixed(0)}m` : `0m`}`}` }`).trim()
}

function setInterval(wrapped, timeout) {
    let cancel = {"cancelled": false}
    JavaWrapper.methodToJavaAsync(() => {
        while (!cancel.cancelled) {
            Time.sleep(timeout);
            wrapped();
        }
    }).run();
    return cancel;
}

module.exports = { timer, WynGET, setInterval }