import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the initial state with proper typing
const initialState = {
    mobileProfileLoading: false,
  providerProfile: {}
};

export const providerProfileSlice = createSlice({
  name: 'providerProfile',
  initialState,
  reducers: {
    // The reducer to set the service request
    setProviderProfile: (state, action: PayloadAction<any>) => {
      state.providerProfile = action.payload;
    },
    setMobileProfileLoading: (state, action: PayloadAction<boolean>) => {
      state.mobileProfileLoading = action.payload;
    },

  }
});

export const {
  setProviderProfile,
  setMobileProfileLoading
} = providerProfileSlice.actions;
export default providerProfileSlice.reducer;
