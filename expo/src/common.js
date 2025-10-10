import React from 'react'

import {
    AppState,
    findNodeHandle,
    Linking,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    TVEventHandler,
    useTVEventHandler,
    View,
} from 'react-native'

import { Image } from 'expo-image'

import { useKeepAwake } from 'expo-keep-awake';

import { useDebouncedCallback } from 'use-debounce';

import { useAppContext } from './app-context'

import util from './util'

import Snow, {
    SnowBreak,
    SnowDropdown,
    SnowFillView,
    SnowGrid,
    SnowHeader,
    SnowImageButton,
    SnowImageGrid,
    SnowInput,
    SnowLabel,
    SnowModal,
    SnowOverlay,
    SnowRangeSlider,
    SnowTabs,
    SnowTarget,
    SnowText,
    SnowTextButton,
    SnowToggle,
    SnowView,
    useSnowContext
} from 'expo-snowui'

const isWeb = Platform.OS === 'web'
const isAndroid = Platform.OS === 'android'
const isTV = Platform.isTV

export default {
    findNodeHandle,
    isAndroid,
    isTV,
    isWeb,
    useDebouncedCallback,
    useAppContext,
    useKeepAwake,
    useSnowContext,
    useTVEventHandler,
    util,
    AppState,
    FillView: SnowFillView,
    Image,
    Linking,
    Platform,
    React,
    ScrollView,
    Snow,
    SnowBreak,
    SnowDropdown,
    SnowGrid,
    SnowHeader,
    SnowImageButton,
    SnowImageGrid,
    SnowInput,
    SnowLabel,
    SnowModal,
    SnowOverlay,
    SnowRangeSlider,
    SnowTabs,
    SnowTarget,
    SnowText,
    SnowTextButton,
    SnowToggle,
    SnowView,
    Text,
    TouchableOpacity,
    TVEventHandler,
    View,
}
