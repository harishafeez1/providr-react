import { useAuthContext } from '@/auth';
import { StarRating } from '@/components';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel
} from '@/components/ui/carousel';
import { useAppSelector } from '@/redux/hooks';
import { store } from '@/redux/store';
import {
  appendProviders,
  setPagination,
  setLoading,
  appendDirectoryDefaultProviders,
  setDefaultProvidersPagination,
  setDefaultProvidersLoading
} from '@/redux/slices/directory-listing-slice';
import { getProvidersByServiceId } from '@/services/api/all-services';
import { postDirectoryFilters } from '@/services/api/directory';
import { addFavouriteProvider } from '@/services/api/wishlist-favourite';
import { searchNearByProviders } from '@/services/api/search-providers';
import { ArrowLeft, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface SliderProps {
  heading?: string;
  providerData?: any;
  defaultKey?: string;
  isDefaultService?: boolean;
  loading?: boolean;
}

const CustomCarouselNext = ({ isDefaultService }: { isDefaultService?: boolean }) => {
  const { scrollNext, canScrollNext } = useCarousel();
  const { pagination, searchedFromHeader, defaultProvidersPagination, directorySettings } =
    useAppSelector((state) => state.directoryListing);
  const { service_id, location, currentLocation, searchServiceId } = useAppSelector((state) => state.directory);
  const { auth } = useAuthContext();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleNextClick = async () => {
    // Always scroll first
    scrollNext();

    if (isLoadingMore) return;

    // Handle header search pagination (nearby providers)
    if (searchedFromHeader && pagination.currentPage < pagination.lastPage && currentLocation) {
      setIsLoadingMore(true);

      try {
        const nextPage = pagination.currentPage + 1;
        const searchData: {
          latitude: number;
          longitude: number;
          page: number;
          service_id?: string;
        } = {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          page: nextPage
        };

        // Add service_id if it exists (from header search)
        if (searchServiceId && searchServiceId !== '') {
          searchData.service_id = searchServiceId;
        }

        const res = await searchNearByProviders(searchData);
        if (res?.data && res.data.length > 0) {
          store.dispatch(appendProviders(res.data));
          
          // Update pagination if available
          if (res.current_page && res.last_page) {
            store.dispatch(
              setPagination({
                currentPage: res.current_page,
                lastPage: res.last_page
              })
            );
          }
        }
      } catch (error) {
        console.error('Error loading more nearby providers:', error);
      } finally {
        setIsLoadingMore(false);
      }
    }
    // Handle default service pagination
    else if (
      isDefaultService &&
      defaultProvidersPagination.currentPage < defaultProvidersPagination.lastPage
    ) {
      setIsLoadingMore(true);

      try {
        const nextPage = defaultProvidersPagination.currentPage + 1;
        const defaultService = directorySettings?.find(
          (item) => item.key === 'default_active_service'
        );

        if (defaultService) {
          const res = await getProvidersByServiceId(
            defaultService.value.id,
            `page=${nextPage}&per_page=10`,
            auth?.token ? true : false
          );

          if (res.data && res.data.length > 0) {
            store.dispatch(appendDirectoryDefaultProviders(res.data));
            store.dispatch(
              setDefaultProvidersPagination({
                currentPage: res.current_page || nextPage,
                lastPage: res.last_page || defaultProvidersPagination.lastPage
              })
            );
          }
        }
      } catch (error) {
        console.error('Error loading more default providers:', error);
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  const hasMorePages = isDefaultService 
    ? defaultProvidersPagination.currentPage < defaultProvidersPagination.lastPage
    : searchedFromHeader 
      ? pagination.currentPage < pagination.lastPage 
      : false;

  const shouldDisable = isLoadingMore || (!canScrollNext && !hasMorePages);

  return (
    <button
      className="relative h-6 w-6 -translate-x-2 translate-y-0 bg-gray-200 disabled:text-gray-500 disabled:bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
      disabled={shouldDisable}
      onClick={handleNextClick}
    >
      <ChevronRight className="h-4 w-4" />
      {isLoadingMore && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-full">
          <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </button>
  );
};

const SliderListing = ({ heading, providerData, isDefaultService, loading }: SliderProps) => {
  const { currentUser, auth } = useAuthContext();

  const [favouritedIds, setFavouritedIds] = useState<Set<number>>(new Set());

  const handleFavourtie = async (providerId: number) => {
    if (!auth?.token) {
      toast.error('Please Login first', { position: 'top-right' });
    } else {
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
    }
  };

  // Don't render anything if not loading and no providers available
  if (!loading && (!providerData || providerData.length === 0)) {
    return null;
  }

  return (
    <div className="w-[90vw] xl:w-full text-black">
      <Carousel
        opts={{
          align: 'start'
        }}
        className="relative"
      >
        <div className="text-xl font-semibold mb-[24px]">{heading ? `${heading} >` : ''}</div>
        <div className="absolute top-0 right-5 md:right-0 z-10 flex items-center">
          <CarouselPrevious className="relative h-6 w-6 translate-x-8 translate-y-0 bg-gray-200 disabled:text-gray-500 disabled:bg-gray-100" />
          <CustomCarouselNext isDefaultService={isDefaultService} />
        </div>

        <CarouselContent className="mt-2 -ms-2">
          {loading
            ? [...Array(10)].map((_, index) => (
                <CarouselItem
                  key={index}
                  className="basis-[45%] md:basis-[30%] lg:basis-[25%] xl:basis-[14.3%]"
                >
                  <div className="p-1 animate-pulse">
                    <Card className="rounded-2xl h-[148px] md:h-48 bg-gray-200"></Card>
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
                    className="basis-[45%] md:basis-[30%] lg:basis-[25%] xl:basis-[14.3%] cursor-pointer relative pl-[11px] md:w-full"
                  >
                    <Heart
                      className={`text-white absolute z-10 top-4 right-4 ${favouritedIds.has(item?.id) || item?.is_favourite ? 'fill-danger' : ''}`}
                      onClick={() => handleFavourtie(item?.id)}
                      stroke={favouritedIds.has(item?.id) || item?.is_favourite ? 'red' : 'white'}
                      strokeWidth={2}
                    />
                    <Link to={`/provider-profile/${item?.id}`}>
                      <div className="">
                        <Card className="rounded-2xl border-none h-[148px] md:h-[240px] relative overflow-hidden">
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
