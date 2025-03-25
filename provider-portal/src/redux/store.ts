import { configureStore } from '@reduxjs/toolkit';
import usersSlice from './slices/users-slice';
import servicesSlice from './slices/services-slice';
import  notificationsSlice  from './slices/notifications-slice';

export const store = configureStore({
  reducer: {
    users: usersSlice,
    services: servicesSlice,
    notifications: notificationsSlice
  }
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
