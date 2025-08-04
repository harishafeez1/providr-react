import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DirectoryState {
  allServices: any[];
  allProviders: any[];
  pagination: {
    currentPage: number;
    lastPage: number;
    loading: boolean;
  };
  defaultProvidersPagination: {
    currentPage: number;
    lastPage: number;
    loading: boolean;
  };
  isFilterModalOpen: boolean;
  loadMore: boolean;
  directorySettings: any[];
  directoryDefaultProviders: any[];
  directoryDiscoverProviders: any[];
  serviceNamechanged: boolean;
  searchedFromHeader: boolean;
  changedSearchedServiceName: string;
}

const initialState: DirectoryState = {
  allServices: [],
  allProviders: [],
  pagination: {
    currentPage: 1,
    lastPage: 1,
    loading: false
  },
  defaultProvidersPagination: {
    currentPage: 1,
    lastPage: 1,
    loading: false
  },
  isFilterModalOpen: false,
  loadMore: false,
  directorySettings: [],
  directoryDefaultProviders: [],
  directoryDiscoverProviders: [],
  serviceNamechanged: false,
  searchedFromHeader: false,
  changedSearchedServiceName: ''
};

export const directoryListingSlice = createSlice({
  name: 'directoryListing',
  initialState,
  reducers: {
    setListOfServices: (state, action: PayloadAction<any[]>) => {
      const servicesList = action.payload;
      state.allServices =
        servicesList?.map((item) => ({
          label: item.name,
          value: item.id
        })) || [];
    },

    setAllProviders: (state, action: PayloadAction<any[]>) => {
      state.allProviders = action.payload;
    },
    appendProviders: (state, action: PayloadAction<any[]>) => {
      const existingIds = new Set(state.allProviders.map(provider => provider.id));
      const newProviders = action.payload.filter(provider => !existingIds.has(provider.id));
      state.allProviders = [...state.allProviders, ...newProviders];
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
        state.serviceNamechanged = true;
      }
    },
    setChangeServiceName: (state, action) => {
      state.serviceNamechanged = action.payload;
    },
    setIsSearchedFromHeader: (state, action) => {
      state.searchedFromHeader = action.payload;
    },
    setChangeSearchedServiceName: (state, action) => {
      state.changedSearchedServiceName = action.payload;
    },

    appendDirectoryDefaultProviders: (state, action: PayloadAction<any[]>) => {
      const existingIds = new Set(state.directoryDefaultProviders.map(provider => provider.id));
      const newProviders = action.payload.filter(provider => !existingIds.has(provider.id));
      state.directoryDefaultProviders = [...state.directoryDefaultProviders, ...newProviders];
    },

    setDefaultProvidersPagination: (state, action: PayloadAction<{ currentPage: number; lastPage: number }>) => {
      state.defaultProvidersPagination.currentPage = action.payload.currentPage;
      state.defaultProvidersPagination.lastPage = action.payload.lastPage;
    },

    setDefaultProvidersLoading: (state, action: PayloadAction<boolean>) => {
      state.defaultProvidersPagination.loading = action.payload;
    }
  }
});

export const {
  setChangeSearchedServiceName,
  setIsSearchedFromHeader,
  setListOfServices,
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
  setChangeServiceName,
  appendDirectoryDefaultProviders,
  setDefaultProvidersPagination,
  setDefaultProvidersLoading
} = directoryListingSlice.actions;

export default directoryListingSlice.reducer;
