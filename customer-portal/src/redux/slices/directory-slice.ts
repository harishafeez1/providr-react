import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the initial state with proper typing
const initialState = {
  service_id: '',
  location: '',
  currentLocation: null as { latitude: number; longitude: number } | null,
  searchServiceId: '' // Service ID used for header search
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

    setCurrentLocation: (state, action: PayloadAction<{ latitude: number; longitude: number } | null>) => {
      state.currentLocation = action.payload;
    },

    setSearchServiceId: (state, action: PayloadAction<string>) => {
      state.searchServiceId = action.payload;
    },

    setResetFilters: () => initialState
  }
});

export const { setServiceId, setLocation, setCurrentLocation, setSearchServiceId, setResetFilters } = directorySlice.actions;
export default directorySlice.reducer;
