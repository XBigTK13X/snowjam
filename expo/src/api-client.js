import axios from 'axios'
import util from './util'

const JOB_PROPERTIES = [
    ['targetKind', 'target_kind'],
    ['targetId', 'target_id'],
    ['targetDirectory', 'target_directory'],
    ['metadataId', 'metadata_id'],
    ['metadataSource', 'metadata_source'],
    ['seasonOrder', 'season_order'],
    ['episodeOrder', 'episode_order'],
    ['updateMetadata', 'update_metadata'],
    ['updateImages', 'update_images'],
    ['updateVideos', 'update_videos'],
    ['skipExisting', 'skip_existing'],
    ['extractOnly', 'extract_only'],
]

export class ApiClient {
    constructor(details) {
        this.webApiUrl = details.webApiUrl
        this.onApiError = details.onApiError
        this.apiErrorSent = false
        let self = this
        this.createClient(details)

        this.get = async (url, params) => {
            let queryParams = null
            if (params) {
                queryParams = { params: params }
            }
            return this.httpClient
                .get(url, queryParams)
                .then((response) => {
                    return response.data
                })
                .catch((err) => {
                    this.handleError(err)
                })
        }

        this.post = async (url, payload) => {
            return this.httpClient
                .post(url, payload)
                .then((response) => {
                    return response.data
                })
                .catch((err) => {
                    this.handleError(err)
                })
        }

        this.delete = async (url) => {
            return this.httpClient
                .delete(url)
                .then((response) => {
                    return response.data
                })
                .catch((err) => {
                    this.handleError(err)
                })
        }

        this.handleError = (err) => {
            util.log(err)
            if (err) {
                if (err.code && err.code === 'ERR_NETWORK') {
                    if (!self.apiErrorSent) {
                        self.onApiError(err)
                    }
                    self.apiErrorSent = true
                }
            }
        }
    }

    createClient(details) {
        this.baseURL = details.webApiUrl + '/api'
        this.httpClient = axios.create({
            baseURL: this.baseURL,
        })
    }

    getSeriesList() {
        return this.get('/series/list')
    }

    getGameList(seriesId) {
        return this.get(`/game/list?series_id=${seriesId}`)
    }

    getSongList(seriesId, gameId) {
        return this.get(`/song/list?series_id=${seriesId}&game_id=${gameId}`)
    }

    getSongDetails(seriesId, gameId, songId) {
        return this.get(`/song?series_id=${seriesId}&game_id=${gameId}&song_id=${songId}`)
    }

    getSongFileUrl(seriesId, gameId, songId, kind) {
        return this.baseURL + `/song/file?series_id=${seriesId}&game_id=${gameId}&song_id=${songId}&kind=${kind}`
    }

    debug() {
        util.log({ baseURL: this.baseURL })
    }
}

export default ApiClient