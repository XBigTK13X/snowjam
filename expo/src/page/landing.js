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
