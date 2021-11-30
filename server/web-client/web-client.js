class ApiClient {
    constructor() {}

    get(url) {
        return fetch(url).then((result) => {
            return result.json()
        })
    }

    post(url, data) {
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((result) => {
            return result.json()
        })
    }

    getSongList(searchFilter) {
        if (searchFilter) {
            return this.get('/api/song/list?searchFilter=' + searchFilter)
        }
        return this.get('/api/song/list')
    }

    getSong(song_id) {
        return this.get(`/api/song?song_id=${song_id}`)
    }
}

let client = new ApiClient()
let navbar = `<div class="navbar">
      <a href="/" class="nav-button">Songs</a>
      <a class="nav-button" onclick="window.jumpToTop()">Top</a>
      <a class="nav-button" onclick="window.changeScrollSpeed(-1)">Slower</a>
      <a class="nav-button" onclick="window.toggleScroll()">Autoscroll</a>
      <a class="nav-button" onclick="window.changeScrollSpeed(1)">Faster</a>
      <br/>
      <input placeholder="Enter search filter" type="text" name="search-filter" id="search-filter" />
    </div>`

let debounceTimeout = null
let debounceMilliseconds = 500
let debounceNavigate = (url) => {
    if (debounceTimeout !== null) {
        clearTimeout(debounceTimeout)
    }
    debounceTimeout = setTimeout(() => {
        window.location.href = url
    }, debounceMilliseconds)
}

let loadPage = (content) => {
    let markup = `${navbar}<div class="page-content">${content}</div>`
    $('#app-container').html(markup)
    if (window.searchFilter) {
        $('#search-filter').val(window.searchFilter)
    }
    $('#search-filter').on('input', (e) => {
        debounceNavigate('#search?searchFilter=' + e.target.value)
    })
}

let scroll_pixels_per_refresh = 2
let scroll_refresh_rate_start = 100
let scroll_refresh_rate = 100
let scroll_step = 0.8
let scroll_interval = null

window.jumpToTop = () => {
    window.scroll(0, 0)
    if (scroll_interval) {
        clearInterval(scroll_interval)
        scroll_interval = null
    }
}

const scroll = () => {
    window.scrollBy(0, scroll_pixels_per_refresh)
}

window.changeScrollSpeed = (direction) => {
    if (scroll_interval) {
        if (direction < 0) {
            scroll_refresh_rate += scroll_refresh_rate * (1 - scroll_step)
        } else {
            scroll_refresh_rate *= scroll_step
        }
        if (scroll_refresh_rate < 1) {
            scroll_refresh_rate = 0
        }
        if (scroll_refresh_rate > 1000) {
            scroll_refresh_rate = 1000
        }
        clearInterval(scroll_interval)
        scroll_interval = null
    }
    scroll()

    scroll_interval = setInterval(scroll, scroll_refresh_rate)
}

window.toggleScroll = () => {
    if (scroll_interval) {
        clearInterval(scroll_interval)
        scroll_interval = null
    } else {
        scroll_refresh_rate = scroll_refresh_rate_start
        scroll()
        scroll_interval = setInterval(scroll, scroll_refresh_rate_start)
    }
}

window.loadSongs = (searchFilter) => {
    window.jumpToTop()
    client.getSongList(searchFilter).then((response) => {
        let markup = `
          <div>
              <h2>Songs</h2>
              <div>
              ${response.songs.list
                  .map((song_id) => {
                      let song = response.songs.lookup[song_id]
                      return `<a class="song-button${song.is_chord_v1 ? ' chord-v1' : ''}" href="#song?song_id=${song.id}">${song.artist}<br/><b>${
                          song.title
                      }</b></a>`
                  })
                  .join('')}
              </div>
          </div>
      `
        loadPage(markup)
    })
}

window.loadSong = (song_id) => {
    window.jumpToTop()
    client.getSong(song_id).then((response) => {
        let song = response.song
        let song_markup = song.content.html
        let chord_info = ''
        if (song.chord_data) {
            song_markup = song.chord_data.html
            chord_info = `
            <pre class="song-content">
                <span>
                ${song.chord_data.sorted_chords}
                </span>
            </pre>
            `
        }
        let markup = `
    <h2>
        ${song.info.title}
    </h2>
    <h3>Chords</h3>
    ${chord_info}
    <pre class="song-content">
        <span>
            ${song_markup}
        </span>
    </pre>`
        loadPage(markup)
    })
}

const changePage = () => {
    if (window.location.hash && window.location.hash.indexOf('#song?') !== -1) {
        let song_id = window.location.hash.split('song_id=')[1]
        window.loadSong(song_id)
    } else {
        if (window.location.hash && window.location.hash.indexOf('#search?') !== -1) {
            window.searchFilter = window.location.hash.split('searchFilter=')[1]
            window.loadSongs(window.searchFilter)
        } else {
            window.loadSongs()
        }
    }
}

window.onpopstate = (e) => {
    changePage()
}

$(() => {
    changePage()
})
