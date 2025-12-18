import { api } from '@/store/apis/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import reduxDevToolsEnhancer from 'redux-devtools-expo-dev-plugin';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import { rootReducer } from './rootReducer';

const persistedReducer = persistReducer(
  {
    key: 'root',
    version: 1,
    storage: AsyncStorage,
    blacklist: ['roadmapDraft'],
  },
  rootReducer,
);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
      immutableCheck: false,
    }).concat(api.middleware),
  devTools: false,
  enhancers: (getDefaultEnhancers) =>
    getDefaultEnhancers().concat(reduxDevToolsEnhancer()),
});

const persistedStore = persistStore(store);

setupListeners(store.dispatch);

export { persistedStore, store };
