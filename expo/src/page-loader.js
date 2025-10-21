import { View } from 'react-native'
import Snow from 'expo-snowui'
import { AppContextProvider, config, useAppContext } from 'snowjam'
import { routes } from './routes'
import { pages } from './pages'

const appStyle = {
    color: {
        background: 'black',
        text: 'rgb(235, 235, 235)',
        textDark: 'rgb(22, 22, 22)',
        active: 'rgb(150, 150, 150)',
        hover: 'rgba(119, 250, 255, 1)',
        hoverDark: 'rgba(83, 171, 177, 1)',
        core: 'rgba(219, 44, 44, 1)',
        coreDark: 'rgba(136, 27, 27, 1)',
        outlineDark: 'rgb(63, 63, 63)',
        fade: 'rgb(23, 23, 23)',
        transparentDark: 'rgba(0,0,0,0.6)',
        panel: 'rgb(50,50,50)'
    }
}

function PageWrapper(props) {
    const { CurrentPage } = Snow.useSnowContext()
    return <CurrentPage />
}

export default function PageLoader() {
    return (
        <Snow.App
            DEBUG_SNOW={config.debugSnow}
            snowStyle={appStyle}
            routePaths={routes}
            routePages={pages}
            initialRoutePath={routes.landing}
        >
            <AppContextProvider>
                <PageWrapper />
            </AppContextProvider >
        </Snow.App >
    )
}
