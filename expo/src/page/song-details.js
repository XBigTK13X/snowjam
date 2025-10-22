import { C } from 'snowjam'
import DownloadButton from '../comp/download-button'

export default function SongListPage() {
    const { routes, config, apiClient } = C.useAppContext()
    const { SnowStyle, navPush, currentRoute } = C.useSnowContext()

    const { seriesId, gameId, songId } = currentRoute.routeParams

    const [series, setSeries] = C.React.useState(null)
    const [game, setGame] = C.React.useState(null)
    const [song, setSong] = C.React.useState(null)
    const [songDetails, setSongDetails] = C.React.useState(null)

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

    let kinds = Object.keys(songDetails)
    kinds.sort()
    return (
        <>
            <C.SnowHeader center>{series}</C.SnowHeader>
            <C.SnowHeader center>{game}</C.SnowHeader>
            <C.SnowHeader center>{song}</C.SnowHeader>
            <C.SnowGrid itemsPerRow={3} items={kinds} renderItem={(kind) => {
                let name = 'Sheet Music (pdf)'
                if (kind === 'midi') {
                    name = 'Synthesia (mid)'
                }
                else if (kind === 'mus') {
                    name = 'Finale Source (mus)'
                }
                const fileUrl = apiClient.getSongFileUrl(seriesId, gameId, songId, kind)
                return (
                    <DownloadButton
                        title={name}
                        fileUrl={fileUrl}
                        fileName={`${song}.${kind}`}
                        subDir={`${series}/${game}`}
                    />
                )
            }} />
        </>
    )
}
