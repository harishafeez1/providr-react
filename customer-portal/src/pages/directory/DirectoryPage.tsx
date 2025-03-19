import { Fragment, useEffect, useState } from 'react';
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
  setAllServices
} from '@/redux/slices/directory-listing-slice';
import { useAppSelector } from '@/redux/hooks';
import { useLocation } from 'react-router';
import { postDirectoryFilters } from '@/services/api/directory';
import { getAllServices } from '@/services/api/all-services';

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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);

  const { allProviders, pagination, allServices } = useAppSelector(
    (state) => state.directoryListing
  );
  const allFilters = useAppSelector((state) => state.directory);

  useEffect(() => {
    if (location.pathname.includes('directory')) {
      const fromServicePage = sessionStorage.getItem('fromService');
      if (fromServicePage === 'true') {
        sessionStorage.removeItem('fromService');

        // Define and invoke the async function
        const fetchData = async () => {
          try {
            setServicesLoading(true);
            store.dispatch(setLoading(true));

            // Fetch filtered directory data
            const res = await postDirectoryFilters(allFilters);

            // Fetch all services
            const servicesRes = await getAllServices();
            if (servicesRes) {
              store.dispatch(setAllServices(servicesRes));
              setServicesLoading(false);
            }

            // Update providers and pagination based on directory response
            if (res) {
              if (res.directories.current_page === 1) {
                store.dispatch(setAllProviders(res.directories.data));
              } else {
                store.dispatch(appendProviders(res.directories.data));
              }

              store.dispatch(
                setPagination({
                  currentPage: res.directories.current_page,
                  lastPage: res.directories.last_page
                })
              );
            }
          } catch (error) {
            console.error('Error fetching data:', error);
          } finally {
            store.dispatch(setLoading(false));
          }
        };

        fetchData();
      } else {
        fetchProviders(1);
      }
    }
  }, [location.pathname]);

  const fetchProviders = async (page: number) => {
    store.dispatch(setLoading(true));
    setServicesLoading(true);
    try {
      const res = await getListoftProvider(page);
      if (res) {
        store.dispatch(setAllServices(res.services));
        if (page === 1) {
          store.dispatch(setAllProviders(res.directories.data));
        } else {
          store.dispatch(appendProviders(res.directories.data));
        }
        store.dispatch(
          setPagination({
            currentPage: res.directories.current_page,
            lastPage: res.directories.last_page
          })
        );
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      store.dispatch(setLoading(false));
      setServicesLoading(false);
    }
  };

  return (
    <Fragment>
      <Navbar>
        <div className="flex w-full items-center justify-between border-b px-8 py-5">
          {servicesLoading ? (
            Array.from({ length: 20 }).map((_, index) => <ServicesSkeleton key={index} />)
          ) : (
            <PageMenu services={allServices} loading={servicesLoading} />
          )}
          <NavbarActions>
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 rounded-xl border px-4 py-2 hover:shadow-md transition"
            >
              <KeenIcon icon="filter" className="w-5 h-5" />
              <span>Filters</span>
            </button>
            <FilterModal open={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
          </NavbarActions>
        </div>
      </Navbar>

      <DirectoryContent providers={allProviders} loading={pagination.loading} />

      {pagination.currentPage < pagination.lastPage && (
        <div className="flex justify-center mt-6">
          <button
            className="px-4 py-2 btn btn-primary rounded-lg"
            onClick={() => {
              store.dispatch(setLoadMore(true));
              fetchProviders(pagination.currentPage + 1);
            }}
            disabled={pagination.loading}
          >
            {pagination.loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </Fragment>
  );
};

export { DirectoryPage };
