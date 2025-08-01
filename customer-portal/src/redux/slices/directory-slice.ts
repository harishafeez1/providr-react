import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the initial state with proper typing
const initialState = {
  service_id: '',
  location: ''
};

export const directorySlice = createSlice({
  name: 'directory',
  initialState,
  reducers: {
    // The reducer to set the service request
    setServiceId: (state, action: PayloadAction<any>) => {
      state.service_id = action.payload;
    },
    setLocation: (state, action: PayloadAction<any>) => {
      state.location = action.payload;
    },

    setResetFilters: () => initialState
  }
});

export const { setServiceId, setLocation, setResetFilters } = directorySlice.actions;
export default directorySlice.reducer;
