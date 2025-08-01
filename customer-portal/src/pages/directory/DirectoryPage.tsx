import { useEffect, useState } from 'react';
import { DirectoryContent } from './';
import { PageMenu } from './blocks/PageMenu';

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
  setChangeServiceName
} from '@/redux/slices/directory-listing-slice';
import { useAppSelector } from '@/redux/hooks';
import { useLocation } from 'react-router';
import SliderListing from './blocks/SliderListing';
import { getSettings } from '@/services/api/settings';
import { getAllServices, getProvidersByServiceId } from '@/services/api/all-services';
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
  const location = useLocation();
  const [loadingservice, setLoadingService] = useState(false);

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

  const { paginatedServicesList } = useAppSelector((state) => state.services);

  const fetchSettings = async () => {
    const res = await getSettings();
    if (res) {
      store.dispatch(setDirectorySettings(res));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoadingService(true);
      const res = await getAllServices(`page=${1}&per_page=${12}`);
      if (res) {
        setLoadingService(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchServiceProviders = async () => {
      for (const item of directorySettings || []) {
        if (item.key === 'default_active_service') {
          const res = await getProvidersByServiceId(
            item.value.id,
            'page=1',
            auth?.token ? true : false
          );
          store.dispatch(setDirectoryDefaultProviders(res.data));
        }

        if (item.key === 'discover_services') {
          const promises = item.value.map((service: any) =>
            getProvidersByServiceId(service.id, 'page=1', auth?.token ? true : false)
          );

          const results = await Promise.all(promises);
          const providers = results.map((res: any) => res.data);

          store.dispatch(setDirectoryDiscoverProviders(providers));
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
        {locationCheck?.pathname?.includes('directory') && (
          <div className="flex">
            <PageMenu services={paginatedServicesList} loading={loadingservice} />
          </div>
        )}
        {searchedFromHeader && allProviders.length > 0 ? (
          <div className="mt-[12px]">
            <SliderListing
              providerData={allProviders}
              heading={changedSearchedServiceName || 'Cleaning'}
            />
          </div>
        ) : (
          <>
            <div className="mt-[12px]">
              <SliderListing
                providerData={directoryDefaultProviders}
                heading={directorySettings?.[0]?.value?.name || 'Cleaning'}
                defaultKey={'default_active_service'}
              />
            </div>
            <div className="mt-4 flex flex-col text-black ">
              <div className="text-[32px] font-semibold mt-[30px] mb-[10px] leading-normal">
                Discover services on Providr
              </div>
              <DirectoryContent providers={directoryDiscoverProviders} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export { DirectoryPage };
