import { AnimatePresence, motion } from 'motion/react';

import { PropertyCard } from './blocks';
import SliderListing from './blocks/SliderListing';
import { useAppSelector } from '@/redux/hooks';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Card } from '@/components/ui/card';

const DirectoryContent = ({ providers, loading }: any) => {
  const { directorySettings } = useAppSelector((state) => state.directoryListing);

  const discoverServicesSetting = directorySettings?.find(
    (item: any) => item.key === 'discover_services'
  );

  const discoverServiceNames = discoverServicesSetting?.value || [];

  return (
    <>
      <Carousel
        opts={{
          align: 'start'
        }}
        className="w-full"
      >
        <CarouselContent className="mt-2">
          {providers?.length === 0 &&
            [...Array(10)].map((_, index) => (
              <CarouselItem
                key={index}
                className="basis-[50%] sm:basis-1/2 md:basis-[25%] lg:basis-[20%] xl:basis-[14%]"
              >
                <div className="p-1 animate-pulse">
                  <Card className="card-rounded h-48 bg-gray-200 rounded-lg" />
                  <div className="flex flex-col mt-2 gap-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </CarouselItem>
            ))}
        </CarouselContent>
      </Carousel>

      {providers?.map((item: any, index: number) => (
        <div key={index}>
          <SliderListing
            providerData={item}
            heading={discoverServiceNames[index]?.name || 'Service'}
            defaultKey={`discover-providers-${index}`}
          />
        </div>
      ))}
    </>
  );
};

export { DirectoryContent };
