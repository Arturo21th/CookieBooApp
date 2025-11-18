import { Platform } from 'react-native';
import type { ReactNativeFirebase } from '@react-native-firebase/app';

type FirebaseOptions = ReactNativeFirebase.FirebaseAppOptions;

const iosOptions: FirebaseOptions = {
  appId: '1:319126374784:ios:3a737418148c2c4704d965',
  apiKey: 'AIzaSyAJinrtYQ8ZUnaU0n3kzbOMMiuONZkt_MU',
  projectId: 'cookieboo-7bd68',
  messagingSenderId: '319126374784',
  storageBucket: 'cookieboo-7bd68.firebasestorage.app',
  databaseURL: 'https://cookieboo-7bd68.firebaseio.com',
};

const androidOptions: FirebaseOptions = {
  appId: '1:319126374784:android:e4514ffeea9ebac204d965',
  apiKey: 'AIzaSyBb0fsAT5xSQZaLpA_YxIJ8tfAF_gAArhg',
  projectId: 'cookieboo-7bd68',
  messagingSenderId: '319126374784',
  storageBucket: 'cookieboo-7bd68.firebasestorage.app',
  databaseURL: 'https://cookieboo-7bd68.firebaseio.com',
};

export const firebaseOptions =
  Platform.OS === 'ios' ? iosOptions : androidOptions;
