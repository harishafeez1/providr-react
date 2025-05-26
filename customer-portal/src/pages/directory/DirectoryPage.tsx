import { Fragment, Suspense, useEffect, useState } from 'react';
import { DirectoryContent, FilterModal } from './';
import { Navbar, NavbarActions } from '@/partials/navbar';
import { PageMenu } from './blocks/PageMenu';
import { KeenIcon } from '@/components';
import { getListoftProvider } from '@/services/api/provider-profile';

import { store } from '@/redux/store';
import {
  setAllProviders,
  appendProviders,
  setPagination,
  setLoading,
  setLoadMore,
  setDirectorySettings,
  setDirectoryDefaultProviders,
  setDirectoryDiscoverProviders
} from '@/redux/slices/directory-listing-slice';
import { useAppSelector } from '@/redux/hooks';
import { useLocation } from 'react-router';
import { postDirectoryFilters } from '@/services/api/directory';
import { Button } from '@/components/ui/button';
import SliderListing from './blocks/SliderListing';
import { getSettings } from '@/services/api/settings';
import { getAllServices, getProvidersByServiceId } from '@/services/api/all-services';

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
  const location = useLocation();
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);

  const {
    allProviders,
    pagination,
    allServices,
    directoryDefaultProviders,
    directoryDiscoverProviders,
    directorySettings
  } = useAppSelector((state) => state.directoryListing);

  const { paginatedServicesList } = useAppSelector((state) => state.services);

  const fetchSettings = async () => {
    const res = await getSettings();
    if (res) {
      store.dispatch(setDirectorySettings(res));
    }
  };

  useEffect(() => {
    // Define and invoke the async function
    const fetchData = async () => {
      await getAllServices(`page=${1}&per_page=${12}`);
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
          const res = await getProvidersByServiceId(item.value.id, 'page=1');
          store.dispatch(setDirectoryDefaultProviders(res.data));
        }

        if (item.key === 'discover_services') {
          const promises = item.value.map((service: any) =>
            getProvidersByServiceId(service.id, 'page=1')
          );

          const results = await Promise.all(promises);
          const providers = results.map((res: any) => res.data);

          store.dispatch(setDirectoryDiscoverProviders(providers));
        }
      }
    };

    if (directorySettings) {
      fetchServiceProviders();
    }
  }, [directorySettings]);

  const locationCheck = useLocation();

  return (
    <Fragment>
      <div className="my-6 font-montserrat">
        {locationCheck?.pathname?.includes('directory') && (
          <Navbar>
            <div className="flex w-full items-center justify-between">
              <PageMenu services={paginatedServicesList} />
            </div>
          </Navbar>
        )}
        <SliderListing
          providerData={directoryDefaultProviders}
          heading={directorySettings?.[0]?.value?.name || ''}
        />
        <div className="mt-4 flex flex-col text-black ">
          <div className="text-2xl font-semibold my-2">Discover services on Providr</div>
          <DirectoryContent providers={directoryDiscoverProviders} />
        </div>
      </div>
    </Fragment>
  );
};

export { DirectoryPage };
