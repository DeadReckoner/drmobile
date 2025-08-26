import { api } from '@/store/apis/api';
import { roadmapDraftSlicePath } from '@/store/slices/roadmapDraftSlice';
import { handleAuthError } from '@/store/utils/authErrorHandler';
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
    blacklist: [roadmapDraftSlicePath, api.reducerPath],
  },
  rootReducer,
);

const authErrorMiddleware = () => (next: any) => (action: any) => {
  const result = next(action);
  if (
    action?.type?.startsWith?.(api.reducerPath) &&
    action?.payload?.status === 401
  ) {
    handleAuthError(store, persistedStore);
  }
  return result;
};

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .concat(api.middleware)
      .concat(authErrorMiddleware),
});

const persistedStore = persistStore(store);

export { persistedStore, store };
