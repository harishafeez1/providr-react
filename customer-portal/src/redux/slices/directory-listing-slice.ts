
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DirectoryState {
  allServices: any[];
  allProviders: any[];
  pagination: {
    currentPage: number;
    lastPage: number;
    loading: boolean;
  };
  isFilterModalOpen: boolean,
  loadMore: boolean,
  directorySettings: any[],
  directoryDefaultProviders: any[],
  directoryDiscoverProviders: any[],
  serviceNamechanged: boolean

}

const initialState: DirectoryState = {
  allServices:[],
  allProviders: [],
  pagination: {
    currentPage: 1,
    lastPage: 1,
    loading: false
  },
  isFilterModalOpen: false,
  loadMore: false,
  directorySettings:[],
  directoryDefaultProviders: [],
  directoryDiscoverProviders: [],
  serviceNamechanged: false
  
};

export const directoryListingSlice = createSlice({
  name: 'directoryListing',
  initialState,
  reducers: {

    setAllProviders: (state, action: PayloadAction<any[]>) => {
      state.allProviders = action.payload;
      
    },
    appendProviders: (state, action: PayloadAction<any[]>) => {
      state.allProviders = [...state.allProviders, ...action.payload];
    },
    setPagination: (state, action: PayloadAction<{ currentPage: number; lastPage: number }>) => {
      state.pagination.currentPage = action.payload.currentPage;
      state.pagination.lastPage = action.payload.lastPage;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.pagination.loading = action.payload;
    },
    
    setLoadMore: (state, action: PayloadAction<boolean>) => {
      state.loadMore = action.payload;
    },
    setIsFilterModalOpen: (state, action) => {
        state.isFilterModalOpen = action.payload;
      },

    
    setDirectoryDefaultProviders: (state, action) => {
        state.directoryDefaultProviders = action.payload;
        
      },

      setDirectoryDiscoverProviders: (state, action) => {
        state.directoryDiscoverProviders = action.payload;
        
      },

      setDirectorySettings: (state, action) => {

        state.directorySettings = action.payload;
        
      },

      setDefaultServiceName: (state, action) => {
        const serviceName = action.payload;
        if (state.directorySettings.length > 0) {
          state.directorySettings[0].value.name = serviceName;
          state.serviceNamechanged = true
        }
      },
      setChangeServiceName: (state, action) =>{
        state.serviceNamechanged = action.payload
      }
  },
});

export const { 
  setAllProviders, 
  appendProviders, 
  setPagination,
  setLoading,
  setIsFilterModalOpen,
  setLoadMore,
  setDirectorySettings,
  setDefaultServiceName,
  setDirectoryDefaultProviders,
  setDirectoryDiscoverProviders,
  setChangeServiceName

} = directoryListingSlice.actions;

export default directoryListingSlice.reducer;
