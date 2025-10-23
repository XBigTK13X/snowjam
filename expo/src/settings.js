class Config {
    constructor() {
        this.vondoomWebApiUrl = 'http://192.168.101.10:8000' // Desktop
        this.stormWebApiUrl = 'http://192.168.101.30:8000' // Laptop
        this.beastWebApiUrl = 'http://beast.9914.us:9073' // Prod

        this.clientVersion = "1.0.5"
        this.clientBuildDate = "October 23, 2025"
        this.clientDevBuildNumber = 1

        this.webApiUrl = this.beastWebApiUrl

        this.debugSnow = false
    }
}

export const config = new Config()


export function QuietReactWarning() {
    return null
}

export default QuietReactWarning