import { C } from 'snowjam'

export default function SongListPage() {
    const { routes, config, apiClient } = C.useAppContext()
    const { SnowStyle, navPush, currentRoute } = C.useSnowContext()

    const { seriesId, gameId } = currentRoute.routeParams

    const [series, setSeries] = C.React.useState(null)
    const [game, setGame] = C.React.useState(null)
    const [songList, setSongList] = C.React.useState()

    C.React.useEffect(() => {
        apiClient.getSongList(seriesId, gameId).then((response) => {
            setSongList(response.song_list)
            setGame(response.game)
            setSeries(response.series)
        })
    }, [])

    if (!series || !game || !songList) {
        return null
    }

    return (
        <>
            <C.SnowHeader center>{series}</C.SnowHeader>
            <C.SnowHeader center>{game}</C.SnowHeader>
            <C.SnowGrid itemsPerRow={4} items={songList} renderItem={(item) => {
                return <C.SnowTextButton title={item.name} onPress={navPush(routes.songDetails, { seriesId, gameId, songId: item.id }, true)} />
            }} />
        </>
    )
}
