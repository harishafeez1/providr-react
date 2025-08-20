import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface ServiceLocation {
  lat: number;
  lng: number;
  radius_km: number;
}

export interface ServiceOfferingFormData {
  active: boolean;
  service_id: string;
  language_options: string[];
  description: string;
  service_delivered_options: string[];
  age_group_options: string[];
  service_available_options: ServiceLocation[];
}

interface ServiceOfferingState {
  currentOffering: ServiceOfferingFormData;
  isEditing: boolean;
  editingId?: string | null;
  locations: ServiceLocation[];
}

const initialState: ServiceOfferingState = {
  currentOffering: {
    active: true,
    service_id: '',
    language_options: [],
    description: '',
    service_delivered_options: [],
    age_group_options: [],
    service_available_options: []
  },
  isEditing: false,
  editingId: null,
  locations: []
};

export const serviceOfferingSlice = createSlice({
  name: 'serviceOffering',
  initialState,
  reducers: {
    // Set form data for editing
    setServiceOfferingData: (state, action: PayloadAction<ServiceOfferingFormData & { id?: string }>) => {
      console.log('Redux: setServiceOfferingData called with:', action.payload);
      const { id, ...offeringData } = action.payload;
      state.currentOffering = offeringData;
      state.isEditing = !!id;
      state.editingId = id || null;
      
      // Set locations from service_available_options
      console.log('Redux: Setting locations to:', offeringData.service_available_options);
      state.locations = offeringData.service_available_options || [];
    },

    // Update locations from MapboxLocationSelector
    setServiceLocations: (state, action: PayloadAction<ServiceLocation[]>) => {
      console.log('Redux: setServiceLocations called with:', action.payload);
      state.locations = action.payload;
      state.currentOffering.service_available_options = action.payload;
    },

    // Add a single location
    addServiceLocation: (state, action: PayloadAction<ServiceLocation>) => {
      state.locations.push(action.payload);
      state.currentOffering.service_available_options = [...state.locations];
    },

    // Remove a location by index
    removeServiceLocation: (state, action: PayloadAction<number>) => {
      state.locations.splice(action.payload, 1);
      state.currentOffering.service_available_options = [...state.locations];
    },

    // Update a specific location
    updateServiceLocation: (state, action: PayloadAction<{ index: number; location: ServiceLocation }>) => {
      const { index, location } = action.payload;
      if (state.locations[index]) {
        state.locations[index] = location;
        state.currentOffering.service_available_options = [...state.locations];
      }
    },

    // Update form field
    updateFormField: (state, action: PayloadAction<{ field: keyof ServiceOfferingFormData; value: any }>) => {
      const { field, value } = action.payload;
      (state.currentOffering as any)[field] = value;
    },

    // Reset form to initial state
    resetServiceOffering: (state) => {
      state.currentOffering = {
        active: true,
        service_id: '',
        language_options: [],
        description: '',
        service_delivered_options: [],
        age_group_options: [],
        service_available_options: []
      };
      state.isEditing = false;
      state.editingId = null;
      state.locations = [];
    },

    // Set editing mode
    setEditingMode: (state, action: PayloadAction<{ isEditing: boolean; id?: string }>) => {
      state.isEditing = action.payload.isEditing;
      state.editingId = action.payload.id || null;
    }
  }
});

export const {
  setServiceOfferingData,
  setServiceLocations,
  addServiceLocation,
  removeServiceLocation,
  updateServiceLocation,
  updateFormField,
  resetServiceOffering,
  setEditingMode
} = serviceOfferingSlice.actions;

export default serviceOfferingSlice.reducer;