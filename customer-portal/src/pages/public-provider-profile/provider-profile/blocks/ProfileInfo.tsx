import { Facebook, Heart, Instagram, Share, Star, Twitter } from 'lucide-react';
import NDIS from '/media/brand-logos/NDIS-Provider.png';
import { useAuthContext } from '@/auth';
import { useEffect, useState } from 'react';
import { addFavouriteProvider } from '@/services/api/wishlist-favourite';
import { toast } from 'sonner';
import useSharePageUrl from '@/hooks/useShareUrl';
import { ScrollArea } from '@/components/ui/scroll-area';

const ProfileInfo = ({ ProfileData }: any) => {
  const { auth } = useAuthContext();
  const { sharePage, isShareSupported } = useSharePageUrl();
  const [isFavorite, setIsFavorite] = useState(false);
  const toggleFavorite = async () => {
    if (!auth?.token) {
      toast.error('Please log in to favourite this provider.', { position: 'top-right' });
    } else {
      await addFavouriteProvider(ProfileData?.id, auth?.customer?.id);
      setIsFavorite(!isFavorite);
    }
  };

  useEffect(() => {
    if (ProfileData?.is_favourite) {
      setIsFavorite(ProfileData.is_favourite);
    }
  }, [ProfileData?.is_favourite]);
  return (
    <div className="sticky flex flex-col items-center">
      <div className="relative flex items-center">
        <div className="w-[300px] lg:w-[434px] h-[212px]">
          <img
            src={
              ProfileData?.photo_gallery?.[0]
                ? `${import.meta.env.VITE_APP_AWS_URL}/${ProfileData?.photo_gallery?.[0]}`
                : `${import.meta.env.VITE_APP_AWS_URL}/man-helping-woman-for-carrier.png`
            }
            alt=""
            className="w-full h-full object-cover block rounded-3xl"
          />
        </div>
        {ProfileData?.business_logo && (
          <div className="w-[86px] h-[86px] absolute left-[110px] lg:left-[175px] top-[170px]">
            <img
              src={
                ProfileData?.business_logo
                  ? `${import.meta.env.VITE_APP_AWS_URL}/${ProfileData?.business_logo}`
                  : ''
              }
              alt=""
              className="h-full w-full object-cover rounded-full border-white border-2"
            />
          </div>
        )}
      </div>
      <div className="text-2xl font-semibold mt-16 break-words w-80 text-center">
        {ProfileData?.name || ''}
      </div>
      <div className="font-normal text-base text-[#6A6A6A] mt-5 break-words w-80 text-center">
        Ride through Rome in a vintage Fiat 500, capturing authentic, fun moments.
      </div>
      <div className="flex items-center text-[#222222] text-xs mt-5">
        <Star size={11} fill="#222222" />
        <span className="ml-2 font-bold">{ProfileData?.average_rating} </span>
        <span className="ml-2 font-bold">-</span>
        <span className="ml-2 font-bold">{ProfileData?.total_reviews} reviews</span>
      </div>
      <div className="flex items-center space-x-4 mt-5">
        <button
          onClick={sharePage}
          className="flex items-center px-2 py-2 rounded-full font-medium hover:bg-gray-100 transition"
        >
          <Share size={16} className="text-black" />
        </button>

        <button
          onClick={toggleFavorite}
          className="flex items-center px-2 py-2 font-medium hover:bg-gray-100 rounded-full transition"
        >
          <Heart
            size={16}
            className={`text-black ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
          />
        </button>
      </div>

      {/* <div className="flex items-center space-x-6 mt-6">
        {ProfileData?.facebook_url ? (
          <a href={ProfileData?.facebook_url} target="_blank">
            <Facebook
              size={30}
              fill="#fff"
              strokeWidth={1}
              className="bg-black rounded-full p-1 cursor-pointer"
            />
          </a>
        ) : (
          <Facebook size={30} fill="#fff" strokeWidth={1} className="bg-black rounded-full p-1" />
        )}
        {ProfileData?.instagram_url ? (
          <a href={ProfileData?.instagram_url} target="_blank">
            <Instagram
              size={30}
              color="#ffffff"
              strokeWidth={2}
              className="bg-black rounded-full p-[6px] cursor-pointer"
            />
          </a>
        ) : (
          <Instagram
            size={30}
            color="#ffffff"
            strokeWidth={2}
            className="bg-black rounded-full p-[6px]"
          />
        )}
        {ProfileData?.twitter_url ? (
          <a href={ProfileData?.twitter_url} target="_blank">
            <Twitter
              size={30}
              fill="#fff"
              strokeWidth={1}
              className="bg-black rounded-full p-1 cursor-pointer"
            />
          </a>
        ) : (
          <Twitter size={30} fill="#fff" strokeWidth={1} className="bg-black rounded-full p-1" />
        )}
      </div>

      {ProfileData?.registered_for_ndis && (
        <div className="my-6">
          <img src={NDIS} alt="NDIS Registered" />
        </div>
      )} */}

      {/* <ScrollArea className="w-full h-[800px] p-4">
        <div className="ql-content text-[#7B7171]  mb-4 md:mb-0 mt-16">
          <div dangerouslySetInnerHTML={{ __html: ProfileData?.description || '' }}></div>
        </div>
      </ScrollArea> */}
    </div>
  );
};

export { ProfileInfo };
