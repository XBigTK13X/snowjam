import { C } from 'snowjam'

export default function SongListPage() {
    const { routes, config, apiClient } = C.useAppContext()
    const { SnowStyle, navPush, currentRoute } = C.useSnowContext()

    const [songList, setSongList] = C.React.useState()

    C.React.useEffect(() => {
        if (!songList) {
            apiClient.getSongList(currentRoute.routeParams.game).then((response) => {
                setSongList(response)
            })
        }
    }, [songList, apiClient])

    return (
        <C.SnowGrid itemsPerRow={4} items={songList} renderItem={(item) => {
            return <C.SnowTextButton title={item} onPress={() => { }} />
        }} />
    )
}
