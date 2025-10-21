import { C } from 'snowjam'

export default function SeriesListPage() {
    const { routes, config, apiClient } = C.useAppContext()
    const { SnowStyle, navPush } = C.useSnowContext()

    const [seriesList, setSeriesList] = C.React.useState()

    C.React.useEffect(() => {
        if (!seriesList) {
            apiClient.getSeriesList().then((response) => {
                setSeriesList(response)
            })
        }
    }, [seriesList, apiClient])

    return (
        <C.SnowGrid itemsPerRow={4} items={seriesList} renderItem={(item) => {
            return <C.SnowTextButton title={item} onPress={navPush(routes.gameList, { series: item }, true)} />
        }} />
    )
}
