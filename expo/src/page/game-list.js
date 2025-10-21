import { C } from 'snowjam'

export default function GameListPage() {
    const { routes, config, apiClient } = C.useAppContext()
    const { SnowStyle, navPush, currentRoute } = C.useSnowContext()

    const [gameList, setGameList] = C.React.useState()

    C.React.useEffect(() => {
        if (!gameList) {
            console.log({ currentRoute })
            apiClient.getGameList(currentRoute.routeParams.series).then((response) => {
                setGameList(response)
            })
        }
    }, [gameList, apiClient])

    return (
        <C.SnowGrid itemsPerRow={4} items={gameList} renderItem={(item) => {
            return <C.SnowTextButton title={item} onPress={navPush(routes.songList, { game: item }, true)} />
        }} />
    )
}
