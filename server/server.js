const express = require('express')
const app = express()
const songbook = require('./songbook')

const port = 24072
const songbook_root = '/media/trove/share/music/snowjam/songbook'

songbook.ingest(songbook_root)

app.use(express.json())

app.get('/api/song/list', (req, res) => {
    if (req.query && req.query.searchFilter) {
        res.send(songbook.getSongList(req.query.searchFilter))
    } else {
        res.send(songbook.getSongList())
    }
})

app.get('/api/song', async (req, res) => {
    let song_id = req.query.song_id
    songbook
        .getSong(song_id)
        .then((result) => {
            res.send(result)
        })
        .catch((err) => {
            res.send(err)
        })
})

app.use(express.static('.'))
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/web-client/index.html')
})

app.all('*', (req, res) => {
    res.redirect('/')
})

app.listen(port, '0.0.0.0', () => {
    console.log(`Snowjam version 1.0.3 listening at http://0.0.0.0:${port}`)
})
