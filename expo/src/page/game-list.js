import { C } from 'snowjam'

export default function GameListPage() {
    const { routes, config, apiClient } = C.useAppContext()
    const { SnowStyle, navPush, currentRoute } = C.useSnowContext()

    const { seriesId } = currentRoute.routeParams

    const [series, setSeries] = C.React.useState(null)
    const [gameList, setGameList] = C.React.useState(null)

    C.React.useEffect(() => {
        apiClient.getGameList(seriesId).then((response) => {
            setGameList(response.game_list)
            setSeries(response.series)
        })
    }, [])

    if (!series || !gameList) {
        return null
    }

    return (
        <>
            <C.SnowGrid itemsPerRow={4} itemsPerPage={20} items={gameList} renderItem={(item) => {
                return <C.SnowTextButton
                    title={item.name} onPress={navPush(routes.songList, { seriesId, gameId: item.id }, true)} />
            }} />
        </>
    )
}
