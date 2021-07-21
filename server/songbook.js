const files = require("./files");
const fs = require("fs");
var crypto = require("crypto");

class Song {
  constructor(file_path) {
    let parts = file_path.split("/");
    this.name = parts[parts.length - 1];
    if (this.name.indexOf(".") !== -1) {
      this.name = this.name.split(".").slice(0, -1).join(".");
    }
    this.title = this.name.split(" - ")[1];
    this.artist = this.name.split(" - ")[0];
    this.collection = parts[parts.length - 2];
    this.file_path = file_path;
    this.id = crypto.createHash("md5").update(file_path).digest("hex");
  }
}

class Songbook {
  constructor() {
    this.songs = {
      lookup: {},
      list: [],
    };
    this.ingest = (path) => {
      const song_paths = files.walk(path);
      for (let song_path of song_paths) {
        let song = new Song(song_path);
        this.songs.lookup[song.id] = song;
        this.songs.list.push(song.id);
      }
    };
    this.getSongList = () => {
      return { songs: this.songs };
    };
    this.getSong = (song_id) => {
      try {
        const data = fs.readFileSync(
          this.songs.lookup[song_id].file_path,
          "utf8"
        );
        const data_html = data.replace(/(?:\r\n|\r|\n)/g, "<br>");
        return {
          song: {
            info: this.songs.lookup[song_id],
            content: {
              raw: data,
              html: data_html,
            },
          },
        };
      } catch (err) {
        return { err };
      }
    };
  }
}

let instance = new Songbook();

module.exports = instance;
