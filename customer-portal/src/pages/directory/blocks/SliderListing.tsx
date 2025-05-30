import { useAuthContext } from '@/auth';
import { StarRating } from '@/components';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { getProvidersByServiceId } from '@/services/api/all-services';
import { addFavouriteProvider } from '@/services/api/wishlist-favourite';
import { ArrowLeft, ChevronLeft, Heart } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface SliderProps {
  heading?: string;
  providerData?: any;
  defaultKey?: string;
}

const SliderListing = ({ heading, providerData }: SliderProps) => {
  const { currentUser } = useAuthContext();

  const [favouritedIds, setFavouritedIds] = useState<Set<number>>(new Set());

  const handleFavourtie = async (providerId: number) => {
    setFavouritedIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(providerId)) {
        updated.delete(providerId);
      } else {
        updated.add(providerId);
      }
      return new Set(updated); // Always return a *new* Set
    });

    const res = await addFavouriteProvider(providerId, currentUser?.id);
    if (res?.status === 200) {
      console.log('Provider added to favourites:', res);
    } else {
      console.error('Failed to add provider to favourites:', res);
    }
  };

  return (
    <div className="relative w-full text-black">
      <Carousel
        opts={{
          align: 'start'
        }}
        className="w-full"
      >
        <div className="text-xl font-semibold mt-4"> {heading ? `${heading} >` : ''}</div>
        <div className="absolute top-0 right-0 z-10 flex items-center">
          <CarouselPrevious className="relative h-6 w-6 translate-x-8 translate-y-0 bg-gray-200 disabled:text-gray-500 disabled:bg-gray-100" />
          <CarouselNext className="relative h-6 w-6 -translate-x-14 translate-y-0 bg-gray-200 disabled:text-gray-500 disabled:bg-gray-100" />
        </div>

        <CarouselContent className="mt-2 -ms-2">
          {providerData?.length === 0
            ? [...Array(10)].map((_, index) => (
                <CarouselItem
                  key={index}
                  className="basis-[15%]  md:basis-[25%] lg:basis-[20%] xl:basis-[14.3%]"
                >
                  <div className="p-1 animate-pulse">
                    <Card className="rounded-2xl h-48 bg-gray-200"></Card>
                    <div className="flex flex-col mt-2 gap-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                </CarouselItem>
              ))
            : providerData?.map((item: any, index: number) => {
                return (
                  <CarouselItem
                    key={index}
                    className="basis-[15%]  md:basis-[25%] lg:basis-[20%] xl:basis-[14.3%] cursor-pointer relative pl-2"
                  >
                    <Heart
                      className={`text-white absolute z-10 top-4 right-4 ${favouritedIds.has(item?.id) || item?.is_favourite ? 'fill-red-500' : ''}`}
                      onClick={() => handleFavourtie(item?.id)}
                      stroke={favouritedIds.has(item?.id) || item?.is_favourite ? 'red' : 'white'}
                      strokeWidth={2}
                    />
                    <Link to={`/provider-profile/${item?.id}`}>
                      <div className="">
                        <Card className="rounded-2xl border-none h-[240px] relative overflow-hidden">
                          <img
                            src={
                              item?.photo_gallery?.[0]
                                ? `${import.meta.env.VITE_APP_AWS_URL}/${item?.photo_gallery?.[0]}`
                                : `${import.meta.env.VITE_APP_AWS_URL}/man-helping-woman-for-carrier.png`
                            }
                            alt={'provider name'}
                            className="h-full w-full object-cover rounded-2xl "
                            loading="lazy"
                          />
                        </Card>
                        <div className="mt-4">
                          <div className="flex flex-col gap-1">
                            <div className="font-semibold truncate text-black">
                              {item?.name ? `${item?.name}` : ''}
                            </div>

                            <StarRating
                              initialRating={item?.review_stats?.average_rating || 0}
                              size={18}
                              isDisabled
                            />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                );
              })}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default SliderListing;
