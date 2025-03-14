
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Service {
  label: string;
  value: number | string;
}

interface ServiceParticipant {
  first_name:string;
  last_name:string;
  gender: string;
  email: string;
  phone: string;
}

interface ServiceLocation {
  latitude?: string;
  longitude?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
}

interface ServicesState {
  wizardData: Record<string, any>; 
  services: Service[];
  selectedServiceId: number;
  serviceLocation: ServiceLocation;
  participantData: ServiceParticipant; 
  serviceDetails: Record<string, any>;
}

const initialState: ServicesState = {
  wizardData: {},
  services: [],
  selectedServiceId: 0,
  serviceLocation: {   
    latitude: "",
    longitude: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zip_code: "",},
  participantData: {
    first_name:"",
    last_name:"",
    gender: "",
    email: "",
    phone: "",
  },
  serviceDetails: {}
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
    },

    setSelectedServiceId: (state, action: PayloadAction<any>)=>{
      state.selectedServiceId = action.payload
    },

    setServiceLocation: (state, action: PayloadAction<any>)=>{
      state.serviceLocation = action.payload
    },

    setServiceParticipantData: (state, action: PayloadAction<ServiceParticipant>)=>{
      state.participantData = action.payload
    },

    setServiceDetails: (state, action: PayloadAction<any>)=>{
      state.serviceDetails = action.payload
    },

    setUpdateWizardData: (state)=>{

        state.wizardData = {
          service_id : state.selectedServiceId,
          ...state.participantData,
          ...state.serviceLocation,
          age_group_options: state.serviceDetails
        };
    
    },

    setResetServiceState: (state) => {
      state.wizardData = {};
      state.selectedServiceId = 0;
      state.serviceLocation = {
        latitude: "",
        longitude: "",
        address: "",
        city: "",
        state: "",
        country: "",
        zip_code: "",
      };
      state.participantData = {
        first_name: "",
        last_name: "",
        gender: "",
        email: "",
        phone: "",
      };
      state.serviceDetails = {};
    }
    ,
  }
});

export const { setServices, setSelectedServiceId, setServiceDetails, setServiceLocation, setServiceParticipantData, setUpdateWizardData, setResetServiceState } = servicesSlice.actions;

export default servicesSlice.reducer;
