import React from 'react';
import { Platform, Alert, PermissionsAndroid } from 'react-native';
import RNBlobUtil from 'react-native-blob-util';
import * as SecureStore from 'expo-secure-store';
import { SnowTextButton } from 'expo-snowui';
import { openDocumentTree, mkdir, writeFile } from 'react-native-saf-x';

const SAF_KEY = 'snowjam_saf_uri';

export default function DownloadButton(props) {
    const [title, setTitle] = React.useState(props.title);

    const mimeMap = { pdf: 'application/pdf', mid: 'audio/midi', mus: 'application/octet-stream' };
    const ext = props.fileName.split('.').pop().toLowerCase();
    const mimeType = mimeMap[ext] || 'application/octet-stream';

    async function ensureStoragePermission() {
        if (Platform.OS !== 'android') return;
        const perms = [
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ];
        for (const p of perms) {
            const ok = await PermissionsAndroid.request(p);
            if (ok !== PermissionsAndroid.RESULTS.GRANTED) throw new Error('Permission denied for external storage.');
        }
    }

    async function getOrAskFolderUri() {
        const saved = await SecureStore.getItemAsync(SAF_KEY);
        if (saved) return saved;
        const dir = await openDocumentTree(true)
        if (dir?.uri) {
            await SecureStore.setItemAsync(SAF_KEY, dir.uri);
            return dir.uri;
        }
        return null;
    }
    const ensureDirChain = async (rootUri, relPath) => {
        const parts = ['snowjam', ...((relPath || '').split('/').filter(Boolean))];
        let parent = rootUri;
        let foundSnowjam = false
        for (const seg of parts) {
            if (seg?.includes("snowjam")) {
                if (foundSnowjam) {
                    continue
                }
                foundSnowjam = true
            }
            try { await mkdir(parent, seg); } catch (_) { }
            parent = `${parent}/${seg}`;
        }
        return parent;
    };
    const onPress = async () => {
        if (Platform.OS === 'web') return;
        try {
            await ensureStoragePermission();

            const rootUri = await getOrAskFolderUri();
            if (!rootUri) {
                Alert.alert('No folder selected', 'Please select a folder to save files.');
                return;
            }

            const res = await RNBlobUtil.config({ fileCache: true }).fetch('GET', props.fileUrl);
            const tempPath = res.path();

            const targetDirUri = await ensureDirChain(rootUri, props.subDir || '');
            const targetFileUri = `${targetDirUri}/${props.fileName}`;

            const dataB64 = await RNBlobUtil.fs.readFile(tempPath, 'base64');
            await writeFile(targetFileUri, dataB64, 'base64');

            setTitle(`Saved to snowjam${props.subDir ? '/' + props.subDir : ''}/${props.fileName}`);
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
}
