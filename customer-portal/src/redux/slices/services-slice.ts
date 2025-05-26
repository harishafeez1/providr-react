
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
  servicesList: any[];
  paginatedServicesList: any[];
  selectedServiceId: number;
  serviceLocation: ServiceLocation;
  participantData: ServiceParticipant; 
  serviceDetails: Record<string, any>;
}

const initialState: ServicesState = {
  wizardData: {},
  services: [],
  servicesList: [],
  paginatedServicesList: [],
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
setAllServices: (state, action: PayloadAction<any>) => {
  const newServicesList = action.payload;

  state.servicesList = newServicesList;

  if (newServicesList?.current_page === 1) {
    // First page: reset pagination list
    state.paginatedServicesList = newServicesList.data || [];
  } else if (newServicesList?.data?.length) {
    // Append new data if available
    state.paginatedServicesList = [
      ...state.paginatedServicesList,
      ...newServicesList.data,
    ];
  }
}
,


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

export const { setAllServices, setSelectedServiceId, setServiceDetails, setServiceLocation, setServiceParticipantData, setUpdateWizardData, setResetServiceState } = servicesSlice.actions;

export default servicesSlice.reducer;
