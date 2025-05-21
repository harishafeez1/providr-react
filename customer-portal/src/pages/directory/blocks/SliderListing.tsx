import { StarRating } from '@/components';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';

interface SliderProps {
  heading: string;
  providerData: any;
}

const SliderListing = ({ heading, providerData }: SliderProps) => {
  return (
    <div className="relative w-full text-black">
      <Carousel
        opts={{
          align: 'start'
        }}
        className="w-full"
      >
        <div className="text-xl font-semibold">Service in {heading || ''}</div>
        <div className="absolute top-0 right-0 z-10">
          <CarouselPrevious className="relative h-8 w-8 translate-x-8 translate-y-0" />
          <CarouselNext className="relative h-8 w-8 -translate-x-14 translate-y-0" />
        </div>

        <CarouselContent className="mt-2">
          {providerData?.map((item: any, index: number) => {
            <CarouselItem
              key={index}
              className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-[10%]"
            >
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center">
                    <img
                      src={
                        item?.photo_gallery?.[0]
                          ? `${import.meta.env.VITE_APP_AWS_URL}/${item?.photo_gallery?.[0]}`
                          : `${import.meta.env.VITE_APP_AWS_URL}/man-helping-woman-for-carrier.png`
                      }
                      alt={'provider name'}
                      className="h-full w-full object-cover"
                    />
                  </CardContent>
                </Card>
                <div className="mt-4">
                  <div className="flex flex-col gap-1">
                    <div className="font-semibold truncate text-black">
                      {item?.name ? `${item?.name} >` : ''}
                    </div>

                    <StarRating
                      initialRating={item?.review_stats?.average_rating || 0}
                      size={18}
                      isDisabled
                    />
                  </div>
                </div>
              </div>
            </CarouselItem>;
          })}
          {!providerData &&
            Array.from({ length: 20 }).map((_, index) => (
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
  );
};

export default SliderListing;
