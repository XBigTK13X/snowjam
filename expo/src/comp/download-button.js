import React from 'react';
import { Platform, Alert, PermissionsAndroid } from 'react-native';
import RNBlobUtil from 'react-native-blob-util';
import { SnowTextButton } from 'expo-snowui';

const PUBLIC_DIR = '/storage/emulated/0/Download/snowjam';

async function ensureStoragePermission() {
    const perms = [
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    ];
    for (const p of perms) {
        const granted = await PermissionsAndroid.request(p);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            throw new Error('Permission denied for external storage.');
        }
    }
}

const DownloadButton = (props) => {
    const onPress = async () => {
        try {
            await ensureStoragePermission();

            const subDir = props.subDir ? `/${props.subDir}` : '';
            const targetPath = `${PUBLIC_DIR}${subDir}/${props.fileName}`;
            console.log('[DownloadButton] Downloading to:', targetPath);

            const res = await RNBlobUtil.config({
                addAndroidDownloads: {
                    useDownloadManager: true,
                    notification: true,
                    path: targetPath,
                    mime: 'application/pdf', // adjust if needed
                    title: props.fileName,
                    description: 'snowjam download',
                },
            }).fetch('GET', props.fileUrl);

            console.log('[DownloadButton] ✅ Download complete:', res.path());
            Alert.alert('Success', `File saved to:\n${targetPath}`);
        } catch (err) {
            console.error('[DownloadButton] ❌ Error:', err);
            Alert.alert('Error', err.message);
        }
    };

    if (Platform.OS === 'web') {
        return (
            <a
                href={props.fileUrl}
                download={props.fileName}
                style={{ textDecoration: 'none', display: 'inline-block' }}
                onClick={(e) => e.stopPropagation()}
            >
                <SnowTextButton title={props.title} onPress={() => { }} />
            </a>
        );
    }

    return <SnowTextButton title={props.title} onPress={onPress} />;
};

export default DownloadButton;
