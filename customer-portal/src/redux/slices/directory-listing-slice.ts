import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DirectoryState {
  allProviders: any[];
  filteredProviders: any[];
  activeFilters: {
    services: string[];
    [key: string]: any;
  };
  pagination: {
    currentPage: number;
    lastPage: number;
  };
}

const initialState: DirectoryState = {
  allProviders: [],
  filteredProviders: [],
  activeFilters: {
    services: [],
  },
  pagination: {
    currentPage: 1,
    lastPage: 1,
  },
};

export const directoryListingSlice = createSlice({
  name: 'directoryListing',
  initialState,
  reducers: {
    setAllProviders: (state, action: PayloadAction<any[]>) => {
      state.allProviders = action.payload;
      state.filteredProviders = action.payload;
    },
    appendProviders: (state, action: PayloadAction<any[]>) => {
      state.allProviders = [...state.allProviders, ...action.payload];
      state.filteredProviders = state.activeFilters.services.length 
        ? state.filteredProviders 
        : [...state.filteredProviders, ...action.payload];
    },
    setPagination: (state, action: PayloadAction<{ currentPage: number; lastPage: number }>) => {
      state.pagination.currentPage = action.payload.currentPage;
      state.pagination.lastPage = action.payload.lastPage;
    },
    clearFilters: (state) => {
      state.activeFilters = initialState.activeFilters;
      state.filteredProviders = state.allProviders;
    },
  },
});

export const { 
  setAllProviders, 
  appendProviders, 
  setPagination, 
  clearFilters 
} = directoryListingSlice.actions;

export default directoryListingSlice.reducer;
