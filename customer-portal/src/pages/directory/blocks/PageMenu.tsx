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
  setDirectoryDefaultProviders
} from '@/redux/slices/directory-listing-slice';
import { store } from '@/redux/store';
import { getAllServices, getProvidersByServiceId } from '@/services/api/all-services';
import React from 'react';

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

const PageMenu: React.FC<PageMenuProps> = ({ services }) => {
  const { location } = useAppSelector((state) => state.directory);
  const { directorySettings } = useAppSelector((state) => state.directoryListing);
  const { servicesList } = useAppSelector((state) => state.services);

  const handleServiceClick = async (id: number, serviceName: string) => {
    if (id) {
      const res = await getProvidersByServiceId(id, 'page=1');
      if (res?.data && res.data.length > 0) {
        store.dispatch(setDefaultServiceName(serviceName));
        store.dispatch(setDirectoryDefaultProviders(res.data));
      }
    }
  };

  const handleNext = async () => {
    // @ts-ignore
    if (servicesList?.next_page_url === null) return;

    // @ts-ignore
    const nextPage = servicesList?.current_page + 1;
    await getAllServices(`page=${nextPage}&per_page=10`);
  };

  return (
    <>
      <div className="relative w-full text-black">
        <Carousel
          opts={{
            align: 'start'
          }}
          className="w-full"
        >
          <div className="text-xl font-semibold">Service in {location || ''}</div>
          <div className="absolute top-0 right-0 z-10 flex items-center">
            <CarouselPrevious className="relative h-8 w-8 translate-x-8 translate-y-0" />
            <div onClick={handleNext}>
              <CarouselNext className="relative h-8 w-8 -translate-x-14 translate-y-0"></CarouselNext>
            </div>
          </div>

          <CarouselContent className="mt-2">
            {services?.length === 0
              ? [...Array(10)].map((_, index) => (
                  <CarouselItem
                    key={index}
                    className="basis-[10%] md:basis-[20%] lg:basis-[15%] xl:basis-[10%]"
                  >
                    <div className="p-1 animate-pulse">
                      <Card className="rounded-xl h-28 bg-gray-200"></Card>
                      <div className="flex flex-col mt-2 gap-2">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>
                  </CarouselItem>
                ))
              : services?.map((service, index) => (
                  <CarouselItem
                    key={index}
                    className="basis-[10%] md:basis-[20%] lg:basis-[15%] xl:basis-[10%] cursor-pointer"
                    onClick={() => handleServiceClick(service.id, service.name)}
                  >
                    <div className="p-1">
                      <Card className="rounded-xl border-none">
                        <img
                          src={
                            service?.service_image
                              ? service?.service_image
                              : `${import.meta.env.VITE_APP_AWS_URL}/man-helping-woman-for-carrier.png`
                          }
                          alt={'provider name'}
                          className="h-full w-full object-cover rounded-xl"
                          loading="lazy"
                        />
                      </Card>
                      <div className="flex flex-col mt-2">
                        <div className="font-semibold">{service.name || ''}</div>
                        <div className="text-[#7B7171]">
                          {service.provider_companies_count} available
                        </div>
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
