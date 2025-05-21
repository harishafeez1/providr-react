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
import React from 'react';

export interface IServices {
  id: number;
  name: string;
  path?: string;
  service_icon: string;
}

interface PageMenuProps {
  services: IServices[];
  loading?: boolean;
}

const PageMenu: React.FC<PageMenuProps> = ({ services }) => {
  const { location } = useAppSelector((state) => state.directory);

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
          <div className="absolute top-0 right-0 z-10">
            <CarouselPrevious className="relative h-8 w-8 translate-x-8 translate-y-0" />
            <CarouselNext className="relative h-8 w-8 -translate-x-14 translate-y-0" />
          </div>

          <CarouselContent className="mt-2">
            {Array.from({ length: 20 }).map((_, index) => (
              <CarouselItem
                key={index}
                className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-[10%]"
              >
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-6">
                      <span className="text-3xl font-semibold">{index + 1}</span>
                    </CardContent>
                  </Card>
                  <div className="flex flex-col mt-2">
                    <div className="font-semibold">Cleaning</div>
                    <div className="text-[#7B7171]">3 available</div>
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
