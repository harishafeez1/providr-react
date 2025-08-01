import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IServiceRequest } from '../Types/interfaces'; // Import the interface

// Define the initial state with proper typing
const initialState = {
  serviceRequest: {} as IServiceRequest,
  providerProfile: {} as any,
  providerProfileDirectory: {} as any
};

export const serviceRequestSlice = createSlice({
  name: 'serviceRequest',
  initialState,
  reducers: {
    // The reducer to set the service request
    setServiceRequest: (state, action: PayloadAction<IServiceRequest>) => {
      state.serviceRequest = action.payload;
    },

    setProviderProfile: (state, action: PayloadAction<any>) => {
      state.providerProfile = action.payload;
    },
    setProviderProfileDirectory: (state, action: PayloadAction<any>) => {
      state.providerProfile = action.payload;
    }
  }
});

export const { setServiceRequest, setProviderProfile, setProviderProfileDirectory } =
  serviceRequestSlice.actions;
export default serviceRequestSlice.reducer;
