import React from 'react'
import { View } from 'react-native'
import Snow from 'expo-snowui'
import { AppContextProvider, config, useAppContext } from 'snowjam'
import { routes } from './routes'
import { pages } from './pages'

let appStyle = {
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

appStyle.component = {
    input: {
        text: {
            height: 80,
            fontSize: 40
        }
    },
    textButton: {
        wrapper: {
            height: 80
        }
    }
}

function NavControls(props) {
    const { currentRoute, navPush } = Snow.useSnowContext()
    const { seriesId, seriesName, gameId, gameName, songId, songName } = currentRoute.routeParams

    if (currentRoute.routePath === routes.landing || currentRoute.routePath === '/') {
        return props.children
    }
    let homeButton = <Snow.TextButton focusKey="nav-home-button" title="Home" onPress={navPush(routes.landing, true)} />
    let seriesButton = null
    if (seriesId) {
        seriesButton = (
            <>
                <Snow.Break />
                <Snow.Label center>Series</Snow.Label>
                <Snow.TextButton focusKey="nav-series-button" title={`${seriesName}`} onPress={navPush(routes.gameList, {
                    seriesId,
                    seriesName
                }, true)} />
            </>
        )
    }
    let gameButton = null
    if (gameId) {
        gameButton = (
            <>
                <Snow.Break />
                <Snow.Label center>Game</Snow.Label>
                <Snow.TextButton focusKey="nav-game-button" title={`${gameName}`} onPress={navPush(routes.songList, {
                    seriesId,
                    seriesName,
                    gameId,
                    gameName
                }, true)} />
            </>
        )
    }
    let songButton = null
    if (songId) {
        songButton = (
            <>
                <Snow.Break />
                <Snow.Label center>Song</Snow.Label>
                <Snow.TextButton focusKey="nav-song-button" title={`${songName}`} onPress={navPush(routes.songDetails, {
                    seriesId,
                    seriesName,
                    gameId,
                    gameName,
                    songId,
                    songName
                }, true)} />
            </>
        )
    }
    return (
        <View style={{ flexDirection: 'row', flex: 1 }}>
            <View style={{ width: '20%' }}>
                {homeButton}
                {seriesButton}
                {gameButton}
                {songButton}
            </View>
            <Snow.Break vertical />
            <View style={{ width: '80%' }}>
                {props.children}
            </View>
        </View>
    )
}

function PageWrapper(props) {
    const { CurrentPage } = Snow.useSnowContext()
    return (
        <NavControls>
            <CurrentPage />
        </NavControls>
    )
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
