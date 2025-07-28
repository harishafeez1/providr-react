import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  progressBarStatus: '',
  status: ''
};

export const serviceRequestSlice = createSlice({
  name: 'serviceRequest',
  initialState,
  reducers: {
    setProgessBarStatus: (state, action: any) => {
      state.progressBarStatus = action.payload;
    },
    setStatus: (state, action: any) => {
      state.status = action.payload;
    }
  }
});

export const { setProgessBarStatus, setStatus } = serviceRequestSlice.actions;

export default serviceRequestSlice.reducer;
