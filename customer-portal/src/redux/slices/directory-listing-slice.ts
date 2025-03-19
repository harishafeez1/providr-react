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
  loadMore: false
};

export const directoryListingSlice = createSlice({
  name: 'directoryListing',
  initialState,
  reducers: {
    setAllServices: (state, action: PayloadAction<any[]>) => {
      state.allServices = action.payload;
    },
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
  },
});

export const { 
  setAllServices,
  setAllProviders, 
  appendProviders, 
  setPagination,
  setLoading,
  setIsFilterModalOpen,
  setLoadMore
} = directoryListingSlice.actions;

export default directoryListingSlice.reducer;
