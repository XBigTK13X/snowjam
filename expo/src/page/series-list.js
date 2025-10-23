import { C } from 'snowjam'

export default function SeriesListPage() {
    const { routes, config, apiClient } = C.useAppContext()
    const { SnowStyle, navPush } = C.useSnowContext()

    const [seriesList, setSeriesList] = C.React.useState()

    C.React.useEffect(() => {
        apiClient.getSeriesList().then((response) => {
            setSeriesList(response)
        })
    }, [])

    if (!seriesList) {
        return <C.SnowText>Loading series list...</C.SnowText>
    }

    return (
        <C.SnowGrid focusKey="series-grid" itemsPerRow={4} items={seriesList} renderItem={(item) => {
            return <C.SnowTextButton title={item.name} onPress={navPush(routes.gameList, {
                seriesId: item.id,
                seriesName: item.name
            }, true)} />
        }} />
    )
}
