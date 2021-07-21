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

let navbar = `<div class="navbar">
      <button class="nav-button" onclick="window.loadSongs()">Songs</button>
      <button class="nav-button" onclick="window.jumpToTop()">Top</button>
      <button class="nav-button" onclick="window.changeScrollSpeed(-1)">Slower</button>
      <button class="nav-button" onclick="window.toggleScroll()">Autoscroll</button>
      <button class="nav-button" onclick="window.changeScrollSpeed(1)">Faster</button>
    </div>`;

let loadPage = (content) => {
  let markup = `${navbar}<div class="page-content">${content}</div>`;
  $("#app-container").html(markup);
};

let ms_per_second = 1000;
let scroll_pixels_per_refresh = 2;
let scroll_refresh_rate_start = 100;
let scroll_refresh_rate = 100;
let scroll_step = 0.8;
let scroll_interval = null;

window.jumpToTop = () => {
  window.scroll(0, 0);
  if (scroll_interval) {
    clearInterval(scroll_interval);
  }
};

const scroll = () => {
  window.scrollBy(0, scroll_pixels_per_refresh);
};

window.changeScrollSpeed = (direction) => {
  if (scroll_interval) {
    if (direction < 0) {
      scroll_refresh_rate += scroll_refresh_rate * (1 - scroll_step);
    } else {
      scroll_refresh_rate *= scroll_step;
    }
    if (scroll_refresh_rate < 1) {
      scroll_refresh_rate = 0;
    }
    if (scroll_refresh_rate > 1000) {
      scroll_refresh_rate = 1000;
    }
    clearInterval(scroll_interval);
  }
  scroll();

  scroll_interval = setInterval(scroll, scroll_refresh_rate);
};

window.toggleScroll = () => {
  if (scroll_interval) {
    clearInterval(scroll_interval);
  } else {
    scroll_refresh_rate = scroll_refresh_rate_start;
    scroll();
    scroll_interval = setInterval(scroll, scroll_refresh_rate_start);
  }
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
                  return `<button class="song-button" onclick="window.loadSong('${song.id}')">${song.artist}<br/><b>${song.title}</b></button>`;
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
