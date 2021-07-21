class ApiClient {
  constructor() {}

  get(url) {
    return fetch(url).then((result) => {
      return result.json();
    });
  }

  post(url, data) {
    return fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((result) => {
      return result.json();
    });
  }

  getSongList() {
    return this.get("/api/song/list");
  }

  getSong(song_id) {
    return this.get(`/api/song?song_id=${song_id}`);
  }
}

let client = new ApiClient();

let navbar = `<div>
      <button onclick="window.loadSongs()">Songs</button>
    </div>`;

let loadPage = (content) => {
  let markup = `${navbar}${content}`;
  $("#app-container").html(markup);
};

window.loadSongs = () => {
  client.getSongList().then((response) => {
    let markup = `
          <div>
              <h2>Songs</h2>
              <div>
              ${response.songs.list
                .map((song_id) => {
                  let song = response.songs.lookup[song_id];
                  return `<button onclick="window.loadSong('${song.id}')">${song.title}</button>`;
                })
                .join("")}
              </div>
          </div>
      `;
    loadPage(markup);
  });
};

window.loadSong = (song_id) => {
  client.getSong(song_id).then((response) => {
    let song = response.song;
    let markup = `
    <h2>
        ${song.info.title}
    </h2>
    <pre class="song-content">
        ${song.content.html}
    </pre>`;
    loadPage(markup);
  });
};

$(() => {
  window.loadSongs();
});
