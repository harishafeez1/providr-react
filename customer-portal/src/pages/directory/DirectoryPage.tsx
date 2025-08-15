import { useEffect, useState } from 'react';
import { DirectoryContent } from './';
import { PageMenu } from './blocks/PageMenu';
import NoServicesFound from './components/NoServicesFound';

import { store } from '@/redux/store';
import {
  setAllProviders,
  appendProviders,
  setPagination,
  setLoading,
  setLoadMore,
  setDirectorySettings,
  setDirectoryDefaultProviders,
  setDirectoryDiscoverProviders,
  setChangeServiceName,
  setDefaultProvidersPagination
} from '@/redux/slices/directory-listing-slice';
import { useAppSelector } from '@/redux/hooks';
import { useLocation } from 'react-router';
import SliderListing from './blocks/SliderListing';
import { getSettings } from '@/services/api/settings';
import { getAllServices, getProvidersByServiceId } from '@/services/api/all-services';
import { setServicesLoading } from '@/redux/slices/services-slice';
import { useAuthContext } from '@/auth';

function ServicesSkeleton() {
  return (
    <div className="">
      <div className="animate-pulse">
        <div className="h-12 w-12 bg-gray-200 mb-2 rounded-full"></div>
        <div className="space-y-1">
          <div className="h-4 w-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

const DirectoryPage = () => {
  const { auth } = useAuthContext();

  const {
    allProviders,
    pagination,
    allServices,
    directoryDefaultProviders,
    directoryDiscoverProviders,
    directorySettings,
    serviceNamechanged,
    searchedFromHeader,
    changedSearchedServiceName
  } = useAppSelector((state) => state.directoryListing);

  const isDirectoryLoading = useAppSelector((state) => state.directoryListing.pagination.loading);

  const { paginatedServicesList, isServicesLoading } = useAppSelector((state) => state.services);

  const fetchSettings = async () => {
    const res = await getSettings();
    if (res) {
      store.dispatch(setDirectorySettings(res));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      // Only fetch if we don't have services data or if it's the first load
      if (paginatedServicesList.length === 0) {
        store.dispatch(setServicesLoading(true));
        const res = await getAllServices(`page=${1}&per_page=${12}`);
        if (res) {
          store.dispatch(setServicesLoading(false));
        }
      }
    };
    fetchData();
  }, [paginatedServicesList.length]);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchServiceProviders = async () => {
      let defaultServiceId: number | null = null;
      let defaultServiceProviders: any[] = [];

      for (const item of directorySettings || []) {
        if (item.key === 'default_active_service') {
          defaultServiceId = item.value.id;
          const res = await getProvidersByServiceId(
            item.value.id,
            'page=1&per_page=10',
            auth?.token ? true : false
          );
          defaultServiceProviders = res.data;
          store.dispatch(setDirectoryDefaultProviders(res.data));
          store.dispatch(
            setDefaultProvidersPagination({
              currentPage: res.current_page || 1,
              lastPage: res.last_page || 1
            })
          );
        }

        if (item.key === 'discover_services') {
          // Filter out the default service to avoid duplicate API calls
          const uniqueServices = item.value.filter(
            (service: any) => service.id !== defaultServiceId
          );

          const promises = uniqueServices.map((service: any) =>
            getProvidersByServiceId(service.id, 'page=1&per_page=10', auth?.token ? true : false)
          );

          const results = await Promise.all(promises);
          const providers = results.map((res: any) => res.data);

          // Create the full providers array with correct positioning
          const allProviders = item.value.map((service: any) => {
            if (service.id === defaultServiceId) {
              // Use the default service providers that were already fetched
              return defaultServiceProviders;
            } else {
              const uniqueIndex = uniqueServices.findIndex((s: any) => s.id === service.id);
              return uniqueIndex >= 0 ? providers[uniqueIndex] : [];
            }
          });

          store.dispatch(setDirectoryDiscoverProviders(allProviders));
        }
      }
    };

    if (directorySettings && !serviceNamechanged) {
      fetchServiceProviders();
      store.dispatch(setChangeServiceName(false));
    }
  }, [directorySettings]);

  const locationCheck = useLocation();

  return (
    <div className="col-span-12">
      <div className="my-6 font-montserrat">
        {searchedFromHeader && allProviders.length === 0 ? (
          <NoServicesFound serviceType={changedSearchedServiceName || 'services'} />
        ) : (
          <>
            {locationCheck?.pathname?.includes('directory') && (
              <div className="flex">
                <PageMenu services={paginatedServicesList} loading={isServicesLoading} />
              </div>
            )}
            {searchedFromHeader && allProviders.length > 0 ? (
              <div className="mt-6 md:mt-[12px]">
                <SliderListing
                  providerData={allProviders}
                  heading={changedSearchedServiceName || 'Cleaning'}
                  loading={isDirectoryLoading}
                />
              </div>
            ) : (
              <>
                <div className="mt-6 md:mt-[12px]">
                  <SliderListing
                    providerData={directoryDefaultProviders}
                    heading={directorySettings?.[0]?.value?.name || 'Cleaning'}
                    defaultKey={'default_active_service'}
                    isDefaultService={true}
                    loading={isDirectoryLoading}
                  />
                </div>
                <div className="mt-4 flex flex-col text-black ">
                  <div className="text-2xl md:text-[32px] font-semibold mt-[30px] mb-[10px] leading-normal">
                    Discover services on Providr
                  </div>
                  <DirectoryContent providers={directoryDiscoverProviders} />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export { DirectoryPage };
