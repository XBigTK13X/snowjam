import { C } from 'snowjam'

export default function SongListPage() {
    const { routes, config, apiClient } = C.useAppContext()
    const { SnowStyle, navPush, currentRoute } = C.useSnowContext()

    const { seriesId, seriesName, gameId, gameName } = currentRoute.routeParams

    const [songList, setSongList] = C.React.useState()

    C.React.useEffect(() => {
        apiClient.getSongList(seriesId, gameId).then((response) => {
            setSongList(response.song_list)
        })
    }, [])

    if (!songList) {
        return <C.SnowText>Loading song list...</C.SnowText>
    }

    return (
        <>
            <C.SnowGrid focusKey="song-grid" itemsPerRow={2} itemsPerPage={10} items={songList} renderItem={(item) => {
                return <C.SnowTextButton
                    title={item.name} onPress={navPush(routes.songDetails, {
                        seriesId,
                        seriesName,
                        gameId,
                        gameName,
                        songId: item.id,
                        songName: item.name
                    }, true)} />
            }} />
        </>
    )
}
