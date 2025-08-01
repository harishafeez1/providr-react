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
    setUpdateSingleServiceRequest: (state, action: PayloadAction<IServiceRequest>) => {
      const updatedRequest = action.payload;
      if (state.serviceRequest.provider_company_id) {
        const matchedProvider = updatedRequest?.requested_provider_companies?.find(
          (provider: any) =>
            String(provider.id) === String(state.serviceRequest.provider_company_id)
        );
      }
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
