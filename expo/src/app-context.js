import React from 'react';
import Snow from 'expo-snowui'
import { Platform, useTVEventHandler, View } from 'react-native';
import uuid from 'react-native-uuid';

import util from './util'
import { config } from './settings'
import { routes } from './routes'
import { ApiClient } from './api-client'

const AppContext = React.createContext({});

export function useAppContext() {
    const value = React.useContext(AppContext);
    if (!value) {
        throw new Error('appContext must be wrapped in a <AppContextProvider />');
    }
    return value;
}

export function AppContextProvider(props) {
    const { SnowStyle, navPush } = Snow.useSnowContext(props)
    const [apiError, setApiError] = React.useState(null)
    const [apiClient, setApiClient] = React.useState(null)
    const [apiClientKey, setApiClientKey] = React.useState(1)
    const [session, setSession] = React.useState(null)
    const [sessionLoaded, setSessionLoaded] = React.useState(false)
    const [isAdmin, setIsAdmin] = React.useState(false)
    const [displayName, setDisplayName] = React.useState(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [clientOptions, setClientOptions] = React.useState(null)

    React.useEffect(() => {
        if (!apiClient) {
            const storedSession = Snow.loadData('session')
            setSession(storedSession)
            const storedAdmin = Snow.loadData('isAdmin')
            setIsAdmin(storedAdmin)
            setDisplayName(Snow.loadData('displayName'))
            const storedWebApiUrl = Snow.loadData('webApiUrl')
            setIsLoading(false)
            if (storedWebApiUrl) {
                setApiClient(new ApiClient({
                    webApiUrl: storedWebApiUrl,
                    authToken: storedSession,
                    isAdmin: storedAdmin,
                    onApiError: onApiError
                }))
                setApiClientKey((prev) => { return prev + 1 })
            }
            setSessionLoaded(true)
        }
    }, [apiClient, sessionLoaded])


    const onApiError = (err) => {
        if (!apiError) {
            setApiError(err)
        }
    }

    const logout = () => { }

    const setWebApiUrl = (webApiUrl) => {
        return Snow.saveData('webApiUrl', webApiUrl)
            .then(() => {
                setApiClient(null)
                setApiClientKey((prev) => { return prev + 1 })
            })
    }

    if (apiError) {
        return (
            <Snow.Modal focusLayer="api-error" center>
                <Snow.Text>Unable to communicate with Snowjam.</Snow.Text>
                <Snow.Text>Check if your Wi-Fi is disconnected, ethernet unplugged, or if the Snowjam server is down.</Snow.Text>
                <View>
                    <Snow.Grid focusStart focusKey="error-buttons" itemsPerRow={2}>
                        <Snow.TextButton title="Try to Reload" onPress={() => { setApiError(null) }} />
                        <Snow.TextButton title="Change Server" onPress={() => { logout(true) }} />
                    </Snow.Grid>
                </View>
            </Snow.Modal>
        )
    }

    const appContext = {
        config,
        routes,
        session,
        sessionLoaded,
        isLoading,
        apiClient,
        isAdmin,
        displayName,
        setWebApiUrl,
    }

    return (
        <AppContext.Provider
            value={appContext}>
            {props.children}
        </AppContext.Provider>
    );
}

export default AppContextProvider