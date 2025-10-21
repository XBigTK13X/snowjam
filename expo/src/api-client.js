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

    getGameList(series) {
        return this.get(`/game/list?series_name=${series}`)
    }

    getSongList(game) {
        return this.get(`/song/list?game_name=${game}`)
    }

    debug() {
        util.log({ baseURL: this.baseURL })
    }
}

export default ApiClient