import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface notificationsState {
  notificationsList: [];
}

const initialState: notificationsState = {
  notificationsList: []
};

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotificationsList: (state, action: PayloadAction<any>) => {
      state.notificationsList = action.payload;
    }
  }
});

export const { setNotificationsList } = notificationsSlice.actions;

export default notificationsSlice.reducer;
