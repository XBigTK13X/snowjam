import React from 'react';
import { Platform, Alert, PermissionsAndroid } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as FS from 'expo-file-system';
import { SnowTextButton } from 'expo-snowui';

const SAF_KEY = 'snowjam_saf_uri';

async function getValidFolderUri() {
    const savedUri = await SecureStore.getItemAsync(SAF_KEY);
    if (savedUri) {
        try {
            const synthesiaDir = new FS.Directory(savedUri)
            if (synthesiaDir.exists) {
                return saved;
            }
        } catch (swallow) {

        }
    }
    const dir = await new FS.Directory.pickDirectoryAsync();
    console.log({ dir })
    if (dir?.uri) {
        await SecureStore.setItemAsync(SAF_KEY, dir.uri);
        return dir.uri;
    }
    throw new Error('No valid folder selected.');
}


async function ensureStoragePermission() {
    if (Platform.OS !== 'android') return;
    const perms = [
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ];
    for (const p of perms) {
        const ok = await PermissionsAndroid.request(p);
        if (ok !== PermissionsAndroid.RESULTS.GRANTED)
            throw new Error('Permission denied for external storage.');
    }
}

const mimeMap = {
    pdf: 'application/pdf',
    mid: 'audio/midi',
    mus: 'application/octet-stream'
};

export default function DownloadButton(props) {
    const [title, setTitle] = React.useState(props.title);

    const ext = props.fileName.split('.').pop().toLowerCase();
    const mimeType = mimeMap[ext] || 'application/octet-stream';

    const onPress = async () => {
        if (Platform.OS === 'web') return;
        try {
            await ensureStoragePermission();

            const synthesiaDir = await getValidFolderUri();
            if (!synthesiaDir) {
                Alert.alert('No folder selected', 'Please select a folder to save files.');
                return;
            }

            const gameDir = new FS.Directory(synthesiaDir, `snowjam/${props.subDir}`)
            console.log({ gameDir })
            gameDir.create({ idempotent: true, intermediates: true, overwrite: false })
            console.log({ gameDir2: gameDir })
            const songFile = new FS.File(gameDir, props.fileName)
            console.log({ songFile })
            const downloaded = await FS.File.downloadFileAsync(props.fileUrl, songFile, { idempotent: true })
            console.log({ downloaded })

            setTitle(`Saved to ${props.subDir}/${props.fileName}`);
        } catch (err) {
            console.log({ err })
            Alert.alert('Error', err.message || String(err));
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
                <SnowTextButton focusKey={props.focusKey} title={title} onPress={() => { }} />
            </a>
        );
    }

    return <SnowTextButton focusKey={props.focusKey} title={title} onPress={onPress} />;
}
