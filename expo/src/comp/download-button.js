import React from 'react';
import { Platform, Alert, PermissionsAndroid } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { SnowTextButton } from 'expo-snowui';
import { openDocumentTree, mkdir, writeFile, exists } from 'react-native-saf-x';

const SAF_KEY = 'snowjam_saf_uri';

async function getValidFolderUri() {
    const saved = await SecureStore.getItemAsync(SAF_KEY);
    if (saved) {
        try { if (await exists(saved)) return saved; } catch (_) { }
    }
    const dir = await openDocumentTree(true);
    if (dir?.uri) {
        await SecureStore.setItemAsync(SAF_KEY, dir.uri);
        return dir.uri;
    }
    throw new Error('No valid folder selected.');
}

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Failed to read blob'));
        reader.onloadend = () => {
            const res = reader.result;
            const comma = typeof res === 'string' ? res.indexOf(',') : -1;
            resolve(comma >= 0 ? res.slice(comma + 1) : res);
        };
        reader.readAsDataURL(blob);
    });
}

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
            if (ok !== PermissionsAndroid.RESULTS.GRANTED)
                throw new Error('Permission denied for external storage.');
        }
    }

    const ensureDirChain = async (rootUri, relPath) => {
        const parts = ['snowjam', ...((relPath || '').split('/').filter(Boolean))];
        let parent = rootUri;
        let foundSnowjam = false;
        for (const seg of parts) {
            if (seg?.includes('snowjam')) {
                if (foundSnowjam) continue;
                foundSnowjam = true;
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

            const rootUri = await getValidFolderUri();
            if (!rootUri) {
                Alert.alert('No folder selected', 'Please select a folder to save files.');
                return;
            }

            const resp = await fetch(props.fileUrl, { method: 'GET' });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const blob = await resp.blob();
            const typed = blob.type ? blob : blob.slice(0, blob.size, mimeType);
            const dataB64 = await blobToBase64(typed);

            const targetDirUri = await ensureDirChain(rootUri, props.subDir || '');
            const targetFileUri = `${targetDirUri}/${props.fileName}`;

            await writeFile(targetFileUri, dataB64, 'base64');

            setTitle(`Saved to snowjam${props.subDir ? '/' + props.subDir : ''}/${props.fileName}`);
        } catch (err) {
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
