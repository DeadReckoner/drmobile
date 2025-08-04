import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';
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
    // blacklist: ['roadmapDraft'],
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
    }),
});

const persistedStore = persistStore(store);

export { persistedStore, store };
