import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Service {
  label: string;
  value: number | string;
}

interface ServicesState {
  services: Service[];
}

const initialState: ServicesState = {
  services: []
};

export const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setServices: (state, action: PayloadAction<any[]>) => {
      const servicesList = action.payload;
      const transformedServices = servicesList.map((service) => ({
        label: service.name,
        value: service.id
      }));

      state.services = transformedServices;
    }
  }
});

export const { setServices } = servicesSlice.actions;

export default servicesSlice.reducer;
