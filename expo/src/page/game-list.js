import { C } from 'snowjam'

export default function GameListPage() {
    const { routes, config, apiClient } = C.useAppContext()
    const { SnowStyle, navPush, currentRoute } = C.useSnowContext()

    const { seriesId, seriesName } = currentRoute.routeParams

    const [gameList, setGameList] = C.React.useState(null)

    C.React.useEffect(() => {
        apiClient.getGameList(seriesId).then((response) => {
            setGameList(response.game_list)
        })
    }, [])

    if (!gameList) {
        return <C.SnowText>Loading game list...</C.SnowText>
    }

    return (
        <>
            <C.SnowGrid focusKey="game-grid" itemsPerRow={2} itemsPerPage={10} items={gameList} renderItem={(item) => {
                return <C.SnowTextButton
                    title={item.name} onPress={navPush(routes.songList, {
                        seriesId,
                        seriesName,
                        gameId: item.id,
                        gameName: item.name
                    }, true)} />
            }} />
        </>
    )
}
