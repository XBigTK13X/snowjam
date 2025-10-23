import React from 'react';
import { Platform, Alert, PermissionsAndroid } from 'react-native';
import RNBlobUtil from 'react-native-blob-util';
import { SnowTextButton } from 'expo-snowui';

const DownloadButton = (props) => {
    const [title, setTitle] = React.useState(props.title);

    const mimeMap = {
        pdf: 'application/pdf',
        mid: 'audio/midi',
        mus: 'application/octet-stream',
    };

    const ext = props.fileName.split('.').pop().toLowerCase();
    const mimeType = mimeMap[ext] || 'application/octet-stream';

    async function ensureStoragePermission() {
        if (Platform.OS !== 'android') return;
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

    const onPress = async () => {
        if (Platform.OS === 'web') return; // handled by <a> below
        try {
            await ensureStoragePermission();

            const subDir = props.subDir ? `/${props.subDir}` : '';
            const baseDir = RNBlobUtil.fs.dirs.MusicDir || RNBlobUtil.fs.dirs.DownloadDir;
            const targetPath = `${baseDir}/snowjam${subDir}/${props.fileName}`;

            const res = await RNBlobUtil.config({
                addAndroidDownloads: {
                    useDownloadManager: true,
                    notification: true,
                    path: targetPath,
                    mime: mimeType,
                    title: props.fileName,
                    description: 'snowjam download',
                },
            }).fetch('GET', props.fileUrl);

            // Trigger MediaStore indexing so Synthesia sees the file
            try {
                if (RNBlobUtil.MediaCollection?.scanFile) {
                    await RNBlobUtil.MediaCollection.scanFile(targetPath);
                } else if (RNBlobUtil.MediaScanner?.scanFile) {
                    await RNBlobUtil.MediaScanner.scanFile(targetPath, mimeType);
                }
            } catch {
                // Non-fatal: indexing may not be supported on some devices
            }

            setTitle(`Saved to ${targetPath}`);
        } catch (err) {
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
                <SnowTextButton focusKey={props.focusKey} title={title} onPress={() => { }} />
            </a>
        );
    }

    return <SnowTextButton focusKey={props.focusKey} title={title} onPress={onPress} />;
};

export default DownloadButton;
