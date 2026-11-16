import { getApp, getApps, initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyARDx547VhBHpCwy3dWr0lXcAbyeS_eIek',
  authDomain: 'chatapp-5d8db.firebaseapp.com',
  databaseURL: 'https://chatapp-5d8db-default-rtdb.firebaseio.com',
  projectId: 'chatapp-5d8db',
  storageBucket: 'chatapp-5d8db.firebasestorage.app',
  messagingSenderId: '423173290369',
  appId: '1:423173290369:web:05ba58fd450c4b7149d080',
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const database = getDatabase(firebaseApp);
