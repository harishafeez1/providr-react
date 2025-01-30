import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UsersState {
  refreshTable: boolean;
}

const initialState: UsersState = {
  refreshTable: false
};

export const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setRefreshTable: (state, action: PayloadAction<boolean>) => {
      state.refreshTable = action.payload;
    }
  }
});

export const { setRefreshTable } = usersSlice.actions;

export default usersSlice.reducer;
