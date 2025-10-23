import { C } from 'snowjam'

export default function SeriesListPage() {
    const { routes, config, apiClient } = C.useAppContext()
    const { SnowStyle, navPush, currentRoute } = C.useSnowContext()

    const [query, setQuery] = C.React.useState(currentRoute?.routeParams?.query || '')
    const [results, setResults] = C.React.useState({})
    const [hasResults, setHasResults] = C.React.useState(null)

    const performSearch = (submittedQuery) => {
        if (!submittedQuery) {
            submittedQuery = query
        }
        if (submittedQuery?.length > 2) {
            apiClient.search(submittedQuery).then((response) => {
                navPush({ query: submittedQuery })
                setResults(response)
                setHasResults(!!response?.kinds?.length)
            })
        }
    }

    C.React.useEffect(() => {
        if (query) {
            performSearch(query)
        }
    }, [])

    let resultTabs = null
    if (hasResults) {
        const renderSeries = (series) => {
            return <C.SnowTextButton title={series.name} onPress={navPush(
                routes.gameList,
                { seriesId: series.id, seriesName: series.name },
                true
            )} />
        }
        const renderGame = (result) => {
            return <C.SnowTextButton title={`${result.game.name} - ${result.series.name}`} onPress={navPush(
                routes.songList,
                {
                    seriesId: result.series.id,
                    seriesName: result.series.name,
                    gameId: result.game.id,
                    gameName: result.game.name
                },
                true
            )} />
        }
        const renderSong = (result) => {
            return <C.SnowTextButton title={`${result.song.name} - ${result.game.name} - ${result.series.name}`} onPress={navPush(
                routes.songDetails,
                {
                    seriesId: result.series.id,
                    seriesName: result.series.name,
                    gameId: result.game.id,
                    gameName: result.game.name,
                    songId: result.song.id,
                    songName: result.song.name
                },
                true
            )} />
        }
        resultTabs = (
            <C.View style={{ padding: 30 }}>
                <C.SnowTabs style={{ flex: 1 }} key={`tabs-${query}`} headers={results.kinds}>
                    {results?.series ? <C.SnowGrid focusKey="series-grid" itemsPerRow={1} itemsPerPage={5} items={results.series} renderItem={renderSeries} /> : null}
                    {results?.game ? <C.SnowGrid focusKey="game-grid" itemsPerRow={1} itemsPerPage={5} items={results.game} renderItem={renderGame} /> : null}
                    {results?.song ? <C.SnowGrid focusKey="song-grid" itemsPerRow={1} itemsPerPage={5} items={results.song} renderItem={renderSong} /> : null}
                </C.SnowTabs>
            </C.View>
        )
    }

    return (
        <>
            <C.SnowLabel>Search</C.SnowLabel>
            <C.SnowInput focusKey="search-query" value={query} onValueChange={setQuery} onDebounce={performSearch} />
            {resultTabs}
            {hasResults === false && query ? <C.SnowHeader center>No results found for [{query}].</C.SnowHeader> : null}
        </>
    )
}
