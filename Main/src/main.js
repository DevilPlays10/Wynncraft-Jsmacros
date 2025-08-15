
const config = JSON.parse((FS.open('../storage/config.json', 'utf-8')).read())
require('./commands/registerer')

module.exports = {config, WynGET}

function WynGET(path) {
    try {
        const request = Request.create(encodeURI(config.urls.wyn+path))
        if (token) request.addHeader('Authorization', `Bearer ${token}`)
            return request.get()
    } catch(e) {
        return {error: e}
    }
}