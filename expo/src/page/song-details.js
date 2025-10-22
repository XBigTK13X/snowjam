import { C } from 'snowjam'

export default function SongListPage() {
    const { routes, config, apiClient } = C.useAppContext()
    const { SnowStyle, navPush, currentRoute } = C.useSnowContext()

    const { seriesId, gameId, songId } = currentRoute.routeParams

    const [series, setSeries] = C.React.useState(null)
    const [game, setGame] = C.React.useState(null)
    const [song, setSong] = C.React.useState(null)
    const [songDetails, setSongDetails] = C.React.useState()

    C.React.useEffect(() => {
        apiClient.getSongDetails(seriesId, gameId, songId).then((response) => {
            setSongDetails(response.details)
            setSong(response.song)
            setGame(response.game)
            setSeries(response.series)
        })
    }, [])

    if (!series || !game || !song || !songDetails) {
        return null
    }

    return (
        <>
            <C.SnowHeader center>{series}</C.SnowHeader>
            <C.SnowHeader center>{game}</C.SnowHeader>
            <C.SnowHeader center>{song}</C.SnowHeader>
            {Object.keys(songDetails).map((kind) => {
                let name = 'Sheet Music (pdf)'
                if (kind === 'midi') {
                    name = 'Synthesia (mid)'
                }
                else if (kind === 'mus') {
                    name = 'Finale Source (mus)'
                }
                return <C.SnowTextButton title={name} onPress={() => { }} />
            })}
        </>
    )
}
