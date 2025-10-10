class Config {
    constructor() {
        this.vondoomWebApiUrl = 'http://192.168.101.10:8000' // Desktop
        this.stormWebApiUrl = 'http://192.168.101.30:8000' // Laptop
        this.beastWebApiUrl = 'http://beast.9914.us:9063' // Prod

        this.clientVersion = "1.2.2"
        this.clientBuildDate = "October 08, 2025"
        this.clientDevBuildNumber = 1

        this.debugFocus = null
        this.debugNavigation = true
    }
}

export const config = new Config()


export function QuietReactWarning() {
    return null
}

export default QuietReactWarning