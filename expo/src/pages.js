import { routes } from './routes'

import LandingPage from './page/landing'
import BrowsePage from './page/browse'
import SearchPage from './page/search'

export var pages = {
    [routes.landing]: LandingPage,
    [routes.browse]: BrowsePage,
    [routes.search]: SearchPage,
}


export function QuietReactWarning() {
    return null
}

export default QuietReactWarning