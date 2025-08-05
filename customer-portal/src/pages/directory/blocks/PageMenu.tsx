import { useAuthContext } from '@/auth';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { NavbarMenu } from '@/partials/menu/NavbarMenu';
import { useAppSelector } from '@/redux/hooks';
import {
  setDefaultServiceName,
  setDirectoryDefaultProviders,
  setAllProviders,
  setIsSearchedFromHeader,
  setChangeSearchedServiceName,
  setPagination,
  setLoading,
  setDefaultProvidersPagination
} from '@/redux/slices/directory-listing-slice';
import { setServiceId } from '@/redux/slices/directory-slice';
import { store } from '@/redux/store';
import { getAllServices, getProvidersByServiceId } from '@/services/api/all-services';
import { postDirectoryFilters } from '@/services/api/directory';
import React, { useState } from 'react';

export interface IServices {
  id: number;
  name: string;
  service_image: string;
  service_icon: string;
  provider_companies_count: string;
}

interface PageMenuProps {
  services: IServices[];
  loading?: boolean;
}

const PageMenu: React.FC<PageMenuProps> = ({ services, loading }) => {
  const { location } = useAppSelector((state) => state.directory);
  const { directorySettings, searchedFromHeader } = useAppSelector((state) => state.directoryListing);
  const { servicesList } = useAppSelector((state) => state.services);
  const { auth } = useAuthContext();

  const handleServiceClick = async (id: number, serviceName: string, providerCount: string) => {
    if (id) {
      // If no providers available, don't trigger API call or loading
      if (parseInt(providerCount) === 0) {
        return;
      }
      
      store.dispatch(setLoading(true));
      store.dispatch(setServiceId(id));
      
      // If location is selected, use the filter API to get location-based results
      if (location) {
        const filtersToSend = {
          service_id: id,
          location: location,
          page: 1
        };
        
        try {
          const res = await postDirectoryFilters(filtersToSend);
          if (res.directories?.data && res.directories.data.length > 0) {
            store.dispatch(setIsSearchedFromHeader(true));
            store.dispatch(setChangeSearchedServiceName(serviceName));
            store.dispatch(setAllProviders(res.directories.data));
            store.dispatch(
              setPagination({
                currentPage: res.directories.current_page,
                lastPage: res.directories.last_page
              })
            );
          } else {
            // Fallback to regular service providers if no location-based results
            const fallbackRes = await getProvidersByServiceId(id, 'page=1&per_page=10', auth?.token ? true : false);
            if (fallbackRes?.data && fallbackRes.data.length > 0) {
              store.dispatch(setDefaultServiceName(serviceName));
              store.dispatch(setDirectoryDefaultProviders(fallbackRes.data));
              store.dispatch(setDefaultProvidersPagination({
                currentPage: fallbackRes.current_page || 1,
                lastPage: fallbackRes.last_page || 1
              }));
              store.dispatch(setIsSearchedFromHeader(false));
            }
          }
        } catch (error) {
          // Fallback to regular service providers on error
          const fallbackRes = await getProvidersByServiceId(id, 'page=1&per_page=10', auth?.token ? true : false);
          if (fallbackRes?.data && fallbackRes.data.length > 0) {
            store.dispatch(setDefaultServiceName(serviceName));
            store.dispatch(setDirectoryDefaultProviders(fallbackRes.data));
            store.dispatch(setDefaultProvidersPagination({
              currentPage: fallbackRes.current_page || 1,
              lastPage: fallbackRes.last_page || 1
            }));
            store.dispatch(setIsSearchedFromHeader(false));
          }
        }
      } else {
        // No location selected, use regular service provider fetch
        const res = await getProvidersByServiceId(id, 'page=1&per_page=10', auth?.token ? true : false);
        if (res?.data && res.data.length > 0) {
          store.dispatch(setDefaultServiceName(serviceName));
          store.dispatch(setDirectoryDefaultProviders(res.data));
          store.dispatch(setDefaultProvidersPagination({
            currentPage: res.current_page || 1,
            lastPage: res.last_page || 1
          }));
          store.dispatch(setIsSearchedFromHeader(false));
        }
      }
      
      store.dispatch(setLoading(false));
    }
  };

  const handleNext = async () => {
    // @ts-ignore
    if (servicesList?.next_page_url === null) return;

    // @ts-ignore
    const nextPage = servicesList?.current_page + 1;
    await getAllServices(`page=${nextPage}&per_page=10`);
  };

  const [loadedImages, setLoadedImages] = useState(new Set());

  const handleImageLoad = (index: any) => {
    setLoadedImages((prev) => new Set([...prev, index]));
  };

  return (
    <>
      <div className="w-[90vw] xl:w-full text-black">
        <Carousel
          opts={{
            align: 'start'
          }}
          className="relative"
        >
          <div className="text-xl font-semibold mb-[12px]">
            {searchedFromHeader && location ? `Service in ${location}` : 'Services'}
          </div>
          <div className="absolute top-0 right-5 md:right-0 z-10 flex items-center justify-center">
            <CarouselPrevious className="relative h-6 w-6 translate-x-8 translate-y-0 bg-gray-200 disabled:text-gray-500 disabled:bg-gray-100" />
            <CarouselNext className="relative h-6 w-6 -translate-x-14 translate-y-0 bg-gray-200 disabled:text-gray-500 disabled:bg-gray-100" />
          </div>

          <CarouselContent className={`mt-2 ${loading ? '-ms-1' : '-ms-2'}`}>
            {loading
              ? [...Array(10)].map((_, index) => (
                  <CarouselItem
                    key={index}
                    className="basis-[50%] md:basis-[20%] lg:basis-[15%] xl:basis-[10%] pl-0"
                  >
                    <div className="p-1 animate-pulse">
                      <Card className="rounded-xl h-[170px] w-full bg-gray-200" />
                      <div className="flex flex-col mt-2 gap-2">
                        <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>
                  </CarouselItem>
                ))
              : services?.map((service, index) => (
                  <CarouselItem
                    key={index}
                    className={`basis-[50%] md:basis-[20%] lg:basis-[15%] xl:basis-[10%] pl-[10px] md:w-full ${
                      parseInt(service.provider_companies_count) === 0 
                        ? 'cursor-not-allowed' 
                        : 'cursor-pointer'
                    }`}
                    onClick={() => handleServiceClick(service.id, service.name, service.provider_companies_count)}
                  >
                    <Card className="rounded-xl border-none h-[170px] w-full overflow-hidden">
                      <img
                        src={
                          service?.service_image
                            ? service?.service_image
                            : `${import.meta.env.VITE_APP_AWS_URL}/man-helping-woman-for-carrier.png`
                        }
                        alt={service.name || 'Service'}
                        className="h-full w-full object-cover rounded-xl block"
                        loading="lazy"
                        style={{
                          minHeight: '170px',
                          backgroundColor: '#f3f4f6' // fallback background while loading
                        }}
                      />
                    </Card>
                    <div className="flex flex-col mt-2">
                      <div className="font-semibold">{service.name || ''}</div>
                      <div className="text-[#7B7171]">
                        {service.provider_companies_count} available
                      </div>
                    </div>
                  </CarouselItem>
                ))}
          </CarouselContent>
        </Carousel>
      </div>
    </>
    // <div className="w-[90%]">
    //   <NavbarMenu type={true} items={services} loading={loading} />
    // </div>
  );
};

export { PageMenu };
