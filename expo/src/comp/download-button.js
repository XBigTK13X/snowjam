import React, { useMemo } from 'react';
import { Platform, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as SecureStore from 'expo-secure-store';
import { SnowTextButton } from 'expo-snowui';

const ANDROID_FOLDER_KEY = 'user_download_folder_uri';

async function getOrPickAndroidDirectory() {
    const cached = await SecureStore.getItemAsync(ANDROID_FOLDER_KEY);
    if (cached) return cached;

    const perms = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!perms.granted) throw new Error('Permission denied to access external storage.');

    await SecureStore.setItemAsync(ANDROID_FOLDER_KEY, perms.directoryUri);
    return perms.directoryUri;
}

const DownloadButton = (props) => {
    if (Platform.OS === 'web') {
        const href = useMemo(() => {
            const sep = props.fileUrl.includes('?') ? '&' : '?';
            return `${props.fileUrl}${sep}_=${Date.now()}`;
        }, [props.fileUrl]);

        return (
            <a
                href={href}
                download={props.fileName}
                style={{ textDecoration: 'none', display: 'inline-block' }}
                onClick={(e) => e.stopPropagation()}
            >
                <SnowTextButton title={props.title} onPress={() => { }} />
            </a>
        );
    }

    const onPress = async () => {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Cannot save file without permission.');
                return;
            }

            const baseCache = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
            if (!baseCache) throw new Error('No writable cache directory found.');

            const tempPath = `${baseCache}${Date.now()}-${props.fileName}`;
            console.log('[DownloadButton] Downloading to cache:', tempPath);

            const { uri } = await FileSystem.downloadAsync(props.fileUrl, tempPath);
            console.log('[DownloadButton] Download complete:', uri);

            if (Platform.OS === 'android') {
                const baseDirUri = await getOrPickAndroidDirectory();
                console.log('[DownloadButton] Base directory URI:', baseDirUri);

                let targetDirUri = baseDirUri;
                if (props.subDir) {
                    try {
                        targetDirUri = await FileSystem.StorageAccessFramework.makeDirectoryAsync(
                            baseDirUri,
                            props.subDir,
                            { intermediates: true }
                        );
                    } catch (err) {
                        console.warn('[DownloadButton] Subdir may already exist:', err.message);
                    }
                }

                const content = await FileSystem.readAsStringAsync(uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                const destUri = await FileSystem.StorageAccessFramework.createFileAsync(
                    targetDirUri,
                    props.fileName,
                    'application/octet-stream'
                );

                await FileSystem.writeAsStringAsync(destUri, content, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                Alert.alert('Success', `File saved to:\n${destUri}`);
                console.log('[DownloadButton] ✅ Saved to:', destUri);
            } else {
                await MediaLibrary.saveToLibraryAsync(uri);
                Alert.alert('Success', 'File saved to your Files or Photos app.');
            }
        } catch (err) {
            console.error('[DownloadButton] ❌ Error:', err);
            Alert.alert('Error', err.message);
        }
    };

    return <SnowTextButton title={props.title} onPress={onPress} />;
};

export default DownloadButton;
