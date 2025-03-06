import { configureStore } from '@reduxjs/toolkit';
import servicesSlice from './slices/services-slice';
import serviceRequestReducer from './slices/service-request-slice'

export const store = configureStore({
  reducer: {
    services: servicesSlice,
    serviceRequest: serviceRequestReducer
  }
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
