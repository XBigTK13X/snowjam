import React, { useMemo } from 'react';
import { Platform, Alert, TouchableOpacity, Text } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SnowTextButton } from 'expo-snowui';

const ANDROID_FOLDER_KEY = 'user_download_folder_uri';

async function getOrRequestAndroidFolder() {
    const cached = await AsyncStorage.getItem(ANDROID_FOLDER_KEY);
    if (cached) return cached;
    const perms = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!perms.granted) throw new Error('Permission denied to access external storage.');
    await AsyncStorage.setItem(ANDROID_FOLDER_KEY, perms.directoryUri);
    return perms.directoryUri;
}

const DownloadButton = (props) => {
    if (Platform.OS === 'web') {
        const href = useMemo(() => {
            const sep = props.fileUrl.includes('?') ? '&' : '?';
            return `${props.fileUrl}${sep}_=${Date.now()}`
        }, [props.fileUrl]);

        return (
            <a
                href={href}
                download={props.fileName}
                style={{
                    textDecoration: 'none',
                    display: 'inline-block',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <SnowTextButton
                    title={props.title}
                    onPress={() => { }}
                />
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

            const tempPath = `${FileSystem.cacheDirectory}${Date.now()}-${props.fileName}`;
            const { uri } = await FileSystem.downloadAsync(props.fileUrl, tempPath);

            if (Platform.OS === 'android') {
                const baseDirUri = await getOrRequestAndroidFolder();
                const targetDirUri = props.subDir
                    ? await FileSystem.StorageAccessFramework
                        .makeDirectoryAsync(baseDirUri, props.subDir, { intermediates: true })
                        .catch(() => baseDirUri)
                    : baseDirUri;

                const content = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
                const destUri = await FileSystem.StorageAccessFramework.createFileAsync(
                    targetDirUri, props.fileName, 'application/octet-stream'
                );
                await FileSystem.writeAsStringAsync(destUri, content, { encoding: FileSystem.EncodingType.Base64 });
                Alert.alert('Success', 'File saved to your selected folder.');
            } else {
                await MediaLibrary.saveToLibraryAsync(uri);
                Alert.alert('Success', 'File saved to your Files or Photos app.');
            }
        } catch (err) {
            Alert.alert('Error', err.message);
        }
    };

    return <SnowTextButton title={props.title} onPress={onPress} />;
};

export default DownloadButton;
