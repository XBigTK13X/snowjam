const files = require('./files')
const fs = require('fs')
const _ = require('lodash')
var crypto = require('crypto')

class ChordDataV1Line {
    constructor(text_line) {
        if (text_line.indexOf('-- ') !== -1) {
            this.comment = text_line.replace('-- ', '')
        } else if (text_line.indexOf('[') !== -1) {
            this.section = text_line.replace('[', '').replace(']', '')
        } else if (text_line.indexOf('&#') !== -1) {
            this.chord_text = text_line.replace('&#', '')
            this.chord_names = _.uniq(this.chord_text.match(/\S+/g))
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
        } else if (this.chord_text) {
            return `<div class="chord-data-chords">${this.chord_text}</div>`
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
        this.version = '1.0.0'
        this.lines = []
        this.html = ''
        this.sorted_chords = []
        let lines = text_data.split(/\r?\n/)
        for (let line of lines) {
            let chord_line = new ChordDataV1Line(line)
            this.lines.push(chord_line)
            if (chord_line.chord_names) {
                this.sorted_chords = this.sorted_chords.concat(chord_line.chord_names)
            }
            this.html += chord_line.html() + '<br/>'
        }
        this.sorted_chords = _.uniq(this.sorted_chords).sort()
        this.sorted_chords_html = this.sorted_chords
            .map((x) => {
                return `<div class="chord-diagram"><image src="/server/web-client/img/chord/${x}.png" alt="${x}"/></div>`
            })
            .join('')
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

        this.title = this.title.replace('_', "'")
        this.artist = this.artist.replace('_', "'")

        this.file_path = file_path
        this.is_chord_v1 = this.file_path.indexOf('.v1chord') !== -1
        this.id = crypto.createHash('md5').update(file_path).digest('hex')

        this.searchSlug = this.title.toLowerCase() + this.artist.toLowerCase() + this.collection.toLowerCase()
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
        this.searchSongs = (searchFilter) => {
            let songLookup = {}
            searchFilter = searchFilter.toLowerCase()
            let songList = this.songs.list.filter((x) => {
                let song = this.songs.lookup[x]
                return song.searchSlug.indexOf(searchFilter) !== -1
            })
            songList.forEach((songId) => {
                songLookup[songId] = this.songs.lookup[songId]
            })

            return {
                songs: {
                    list: songList,
                    lookup: songLookup,
                },
            }
        }
        this.getSongList = (searchFilter) => {
            if (searchFilter) {
                return this.searchSongs(searchFilter)
            }
            return { songs: this.songs }
        }
        this.getSong = async (song_id) => {
            return new Promise((resolve, reject) => {
                try {
                    let song = this.songs.lookup[song_id]
                    const file_path = this.songs.lookup[song_id].file_path
                    const raw_text = fs.readFileSync(file_path, 'utf8')
                    let chord_data = null
                    if (song.is_chord_v1) {
                        let chord_data_v1 = new ChordDataV1(raw_text)
                        chord_data = {
                            html: chord_data_v1.html,
                            sorted_chords: chord_data_v1.sorted_chords_html,
                            version: chord_data_v1.version,
                        }
                    }
                    const data_html = raw_text.replace(/(?:\r\n|\r|\n)/g, '<br>')
                    resolve({
                        song: {
                            info: this.songs.lookup[song_id],
                            content: {
                                raw: raw_text,
                                html: data_html,
                            },
                            chord_data,
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
