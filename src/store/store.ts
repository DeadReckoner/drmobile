import { api } from '@/store/apis/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { AppState } from 'react-native';
import {
  createMigrate,
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import { migrations } from './migrations';
import { rootReducer } from './rootReducer';

const persistedReducer = persistReducer(
  {
    key: 'root',
    version: 2,
    storage: AsyncStorage,
    blacklist: ['roadmapDraft', 'toast'],
    migrate: createMigrate(migrations, { debug: false }),
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
      immutableCheck: {
        warnAfter: 128,
      },
    }).concat(api.middleware),
  devTools: false,
  enhancers: (getDefaultEnhancers) => getDefaultEnhancers(),
});

const persistedStore = persistStore(store, null, () => {
  const queries = store.getState()[api.reducerPath]?.queries ?? {};
  const hasPendingQueries = Object.values(queries).some(
    (query) => (query as { status: string } | undefined)?.status === 'pending',
  );
  if (hasPendingQueries) {
    store.dispatch(api.util.resetApiState());
  }
});

setupListeners(store.dispatch, (dispatch, { onFocus, onFocusLost }) => {
  const subscription = AppState.addEventListener('change', (nextState) => {
    if (nextState === 'active') {
      dispatch(onFocus());
    } else {
      dispatch(onFocusLost());
    }
  });
  return () => subscription.remove();
});

export { persistedStore, store };
