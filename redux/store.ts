import { graphqlAuthApi } from "@/redux/services/auth/graphqlAuthApi";
import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./services/auth/authSlice";
import { httpUserApi } from "./services/user/userApi";

// const persistConfig = {
//   key: 'root',
//   storage,
//   whitelist: ['auth']
// }

// const persistedAuthReducer = persistReducer(persistConfig, authReducer)

export const store = configureStore({
  reducer: {
    [graphqlAuthApi.reducerPath]: graphqlAuthApi.reducer,
    [httpUserApi.reducerPath]: httpUserApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(graphqlAuthApi.middleware)
      .concat(httpUserApi.middleware),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
