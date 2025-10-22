import { routes } from './routes'

import GameListPage from './page/game-list'
import LandingPage from './page/landing'
import SeriesListPage from './page/series-list'
import SearchPage from './page/search'
import SongListPage from './page/song-list'
import SongDetailsPage from './page/song-details'

export var pages = {
    [routes.gameList]: GameListPage,
    [routes.landing]: LandingPage,
    [routes.seriesList]: SeriesListPage,
    [routes.search]: SearchPage,
    [routes.songList]: SongListPage,
    [routes.songDetails]: SongDetailsPage
}


export function QuietReactWarning() {
    return null
}

export default QuietReactWarning