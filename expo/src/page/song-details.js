import { C } from 'snowjam'
import DownloadButton from '../comp/download-button'

export default function SongListPage() {
    const { routes, config, apiClient } = C.useAppContext()
    const { SnowStyle, navPush, currentRoute } = C.useSnowContext()

    const { seriesId, seriesName, gameId, gameName, songId, songName } = currentRoute.routeParams

    const [songDetails, setSongDetails] = C.React.useState(null)

    C.React.useEffect(() => {
        apiClient.getSongDetails(seriesId, gameId, songId).then((response) => {
            setSongDetails(response.details)
        })
    }, [])

    if (!songDetails) {
        return <C.SnowText>Loading song details...</C.SnowText>
    }

    let kinds = Object.keys(songDetails)
    kinds.sort()
    return (
        <>
            <C.SnowGrid focusKey="download-grid" itemsPerRow={1} items={kinds} renderItem={(kind) => {
                let name = 'Download Sheet Music .pdf'
                if (kind === 'midi') {
                    name = 'Download Synthesia .mid'
                }
                else if (kind === 'mus') {
                    name = 'Download Finale Source .mus'
                }
                const fileUrl = apiClient.getSongFileUrl(seriesId, gameId, songId, kind)
                return (
                    <DownloadButton
                        focusKey={`download-${kind}`}
                        title={name}
                        fileUrl={fileUrl}
                        fileName={`${songName}.${kind}`}
                        subDir={`${seriesName}/${gameName}`}
                    />
                )
            }} />
        </>
    )
}
