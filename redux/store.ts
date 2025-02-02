import { graphqlAuthApi } from "@/redux/services/auth/graphqlAuthApi";
import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./services/auth/authSlice";
import { httpUserApi } from "./services/user/userApi";
import { httpChannelApi } from "./services/channel/channelApi";
import { httpVideoApi } from "./services/channel/videoApi";
import { httpPlaylistApi } from "./services/channel/plalylistApi";
import { httpRecommendationApi } from "./services/recommendation/recommendationApi";
import { httpCommunityApi } from "./services/community/communityApi";

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
    [httpChannelApi.reducerPath]: httpChannelApi.reducer,
    [httpVideoApi.reducerPath]: httpVideoApi.reducer,
    [httpPlaylistApi.reducerPath]: httpPlaylistApi.reducer,
    [httpRecommendationApi.reducerPath]: httpRecommendationApi.reducer,
    [httpCommunityApi.reducerPath]: httpCommunityApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(graphqlAuthApi.middleware)
      .concat(httpUserApi.middleware)
      .concat(httpChannelApi.middleware)
      .concat(httpVideoApi.middleware)
      .concat(httpPlaylistApi.middleware)
      .concat(httpRecommendationApi.middleware)
      .concat(httpCommunityApi.middleware),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
