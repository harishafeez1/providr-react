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
      toast.error('Please login to favorite this provider', { position: 'top-right' });
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
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="w-[259px] h-[181px] aspect-auto">
          <img
            src={
              ProfileData?.photo_gallery?.[0]
                ? `${import.meta.env.VITE_APP_AWS_URL}/${ProfileData?.photo_gallery?.[0]}`
                : `${import.meta.env.VITE_APP_AWS_URL}/man-helping-woman-for-carrier.png`
            }
            alt=""
            className="w-full h-full object-cover block"
          />
        </div>
        {ProfileData?.business_logo && (
          <div className="w-[140px] h-[140px] overflow-hidden absolute left-14 top-28">
            <img
              src={
                ProfileData?.business_logo
                  ? `${import.meta.env.VITE_APP_AWS_URL}/${ProfileData?.business_logo}`
                  : ''
              }
              alt=""
              className="h-full w-full object-cover rounded-full"
            />
          </div>
        )}
      </div>
      <div className="text-2xl font-semibold mt-20 break-words w-80 flex justify-center">
        {ProfileData?.name || ''}
      </div>
      <div className="flex items-center my-2">
        <Star size={20} className="text-black mb-1" />
        <span className="ml-2 text-lg font-bold">{ProfileData?.average_rating} </span>
        <span className="ml-2 text-lg font-bold">-</span>
        <span className="ml-2 text-lg font-bold">{ProfileData?.total_reviews} reviews</span>
      </div>
      <div className="flex items-center space-x-4 mt-2">
        <button className="flex items-center font-medium hover:underline" onClick={sharePage}>
          <Share size={20} className="text-black font-bold" />
        </button>
        <button onClick={toggleFavorite} className="flex items-center font-medium hover:underline">
          <Heart
            size={20}
            className={`text-black font-bold ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
          />
        </button>
      </div>
      <div className="flex items-center space-x-6 mt-6">
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
      )}

      <ScrollArea className="w-full h-[800px] p-4">
        <div className="ql-content text-[#7B7171]  mb-4 md:mb-0 mt-16">
          <div dangerouslySetInnerHTML={{ __html: ProfileData?.description || '' }}></div>
        </div>
      </ScrollArea>
    </div>
  );
};

export { ProfileInfo };
