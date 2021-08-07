const files = require('./files')
const fs = require('fs')
var crypto = require('crypto')

class ChordDataV1Line {
    constructor(text_line) {
        if (text_line.indexOf('-- ') !== -1) {
            this.comment = text_line.replace('-- ', '')
        } else if (text_line.indexOf('[') !== -1) {
            this.section = text_line.replace('[', '').replace(']', '')
        } else if (text_line.indexOf('&#') !== -1) {
            this.chords = text_line.replace('&#', '')
        } else if (!text_line) {
            this.pause = true
        } else {
            this.lyrics = text_line
        }
    }

    html() {
        if (this.comment) {
            return `<div class="chord-data-comment">${this.comment}</div>`
        } else if (this.section) {
            return `<div class="chord-data-section">${this.section}</div>`
        } else if (this.chords) {
            return `<div class="chord-data-chords">${this.chords}</div>`
        } else if (this.pause) {
            return '<br/>'
        } else if (this.lyrics) {
            return `<div class="chord-data-lyrics">${this.lyrics}</div>`
        } else {
            return `UNCLASSIFIED!`
        }
    }
}

class ChordDataV1 {
    constructor(text_data) {
        this.lines = []
        this.html = ''
        let lines = text_data.split(/\r?\n/)
        for (let line of lines) {
            let chord_line = new ChordDataV1Line(line)
            this.lines.push(chord_line)
            this.html += chord_line.html() + '<br/>'
        }
    }
}

class Song {
    constructor(file_path) {
        let parts = file_path.split('/')
        this.name = parts[parts.length - 1]
        if (this.name.indexOf('.') !== -1) {
            this.name = this.name.split('.').slice(0, -1).join('.')
        }
        if (this.name.indexOf(' - ') !== -1) {
            this.title = this.name.split(' - ')[1]
            this.artist = this.name.split(' - ')[0]
            this.collection = parts[parts.length - 2]
        } else {
            this.title = this.name
            this.artist = parts[parts.length - 2]
            this.collection = parts[parts.length - 3]
        }

        this.file_path = file_path
        this.id = crypto.createHash('md5').update(file_path).digest('hex')
    }
}

class Songbook {
    constructor() {
        this.songs = {
            lookup: {},
            list: [],
        }
        this.chord_data_cache = {}
        this.ingest = (path) => {
            const song_paths = files.walk(path)
            for (let song_path of song_paths) {
                let song = new Song(song_path)
                this.songs.lookup[song.id] = song
                this.songs.list.push(song.id)
            }
            this.songs.list.sort((a, b) => {
                if (this.songs.lookup[a].artist === this.songs.lookup[b].artist) {
                    return this.songs.lookup[a].title < this.songs.lookup[b].title ? -1 : 1
                }
                return this.songs.lookup[a].artist < this.songs.lookup[b].artist ? -1 : 1
            })
        }
        this.getSongList = () => {
            return { songs: this.songs }
        }
        this.getSong = async (song_id) => {
            return new Promise((resolve, reject) => {
                try {
                    const file_path = this.songs.lookup[song_id].file_path
                    const raw_text = fs.readFileSync(file_path, 'utf8')
                    let chord_data_v1 = null
                    if (file_path.indexOf('.v1chord') !== -1) {
                        chord_data_v1 = new ChordDataV1(raw_text).html
                    }
                    const data_html = raw_text.replace(/(?:\r\n|\r|\n)/g, '<br>')
                    resolve({
                        song: {
                            info: this.songs.lookup[song_id],
                            content: {
                                raw: raw_text,
                                html: data_html,
                                chord_data_v1,
                            },
                        },
                    })
                } catch (err) {
                    reject({ err })
                }
            })
        }
    }
}

let instance = new Songbook()

module.exports = instance
