import { C } from 'snowjam'

// This is the default expo-router route '/'
export default function LandingPage() {
    const { routes, config } = C.useAppContext()
    const { SnowStyle, navPush } = C.useSnowContext()

    const styles = {
        footer: {
            width: '100%',
            textAlign: 'right',
            color: SnowStyle.color.active
        }
    }



    C.React.useEffect(() => {
        const params = {
            seriesId: 'b18aa59f95cd93d059b8e797bc52fc61',
            seriesName: 'Animal Crossing',
            gameId: 'b18aa59f95cd93d059b8e797bc52fc61',
            gameName: 'Animal Crossing',
            songId: '1eba7893aebe14a7963a110ba2ef4374',
            songName: '1 00 P.M.'
        }
        navPush(routes.songDetails, params)
    }, [])

    return (
        <C.View>
            <C.SnowGrid itemsPerRow={2}>
                <C.SnowTextButton title="Browse" onPress={navPush(routes.seriesList, true)} />
                <C.SnowTextButton title="Search" onPress={navPush(routes.search, true)} />
            </C.SnowGrid>
            <C.SnowText style={styles.footer} center>{`v${config.clientVersion} - built ${config.clientBuildDate}`}</C.SnowText>
        </C.View>
    )
}
