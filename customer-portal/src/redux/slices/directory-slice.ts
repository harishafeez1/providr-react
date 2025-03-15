
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the initial state with proper typing
const initialState = {
    service_id : '',
    location: '',
    age_group: '',
    ndis_register: {
        ndis_registered: 0,
        ndis_childhood_registered: 0,
    },
   
    
  };


  export const directorySlice = createSlice({
    name: 'directory',
    initialState,
    reducers: {
      // The reducer to set the service request
     setServiceId: (state, action: PayloadAction<any>) => {

        state.service_id  = action.payload;
     },
     setLocation: (state, action: PayloadAction<any>) => {

        state.location  = action.payload;
     },
     setAgeGroup: (state, action: PayloadAction<any>) => {

        state.age_group  = action.payload;
     },
     setNdisRegistered: (state, action) => {
        state.ndis_register.ndis_registered = action.payload;
      },
      setNdisChildhoodRegistered: (state, action) => {
        state.ndis_register.ndis_childhood_registered = action.payload;
      },

  }});
  
  export const {  setServiceId, setLocation, setAgeGroup, setNdisRegistered, setNdisChildhoodRegistered} = directorySlice.actions;
  export default directorySlice.reducer;
