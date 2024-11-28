import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { graphqlAuthApi } from "./services/auth/graphqlAuthApi";
import authReducer from "./services/auth/authSlice";

// const persistConfig = {
//   key: 'root',
//   storage,
//   whitelist: ['auth']
// }

// const persistedAuthReducer = persistReducer(persistConfig, authReducer)

export const store = configureStore({
  reducer: {
    [graphqlAuthApi.reducerPath]: graphqlAuthApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(graphqlAuthApi.middleware),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
