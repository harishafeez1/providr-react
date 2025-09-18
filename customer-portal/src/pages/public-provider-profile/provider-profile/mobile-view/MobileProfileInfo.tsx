import { useAppSelector } from '@/redux/hooks';
import { Facebook, Heart, Instagram, Share, Star, Twitter } from 'lucide-react';
import NDIS from '/media/brand-logos/NDIS-Provider.png';
import { useAuthContext } from '@/auth';
import { useEffect, useState, useRef } from 'react';
import { addFavouriteProvider } from '@/services/api/wishlist-favourite';
import { toast } from 'sonner';
import useSharePageUrl from '@/hooks/useShareUrl';

const MobileProfileInfo = () => {
  const { providerProfile } = useAppSelector((state: any) => state.providerProfile);
  const { auth } = useAuthContext();
  const { sharePage, isShareSupported } = useSharePageUrl();
  
  const handleShare = () => {
    sharePage();
  };
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showViewMore, setShowViewMore] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

  // Missing variables from desktop version now available
  const registeredForNdis = providerProfile?.registered_for_ndis;
  const facebookUrl = providerProfile?.facebook_url;
  const instagramUrl = providerProfile?.instagram_url;
  const twitterUrl = providerProfile?.twitter_url;
  const description = providerProfile?.description;
  const isFavourite = providerProfile?.is_favourite;

  const toggleFavorite = async () => {
    if (!auth?.token) {
      toast.error('Please log in to favourite this provider.', { position: 'top-right' });
    } else {
      try {
        await addFavouriteProvider(providerProfile?.id, auth?.customer?.id);
        setIsFavorite(!isFavorite);
        toast.success('Provider added to favorites!', { position: 'top-right' });
      } catch (error) {
        toast.error('Failed to add to favorites', { position: 'top-right' });
      }
    }
  };

  useEffect(() => {
    if (isFavourite) {
      setIsFavorite(isFavourite);
    }
  }, [isFavourite]);

  useEffect(() => {
    const checkTextOverflow = () => {
      if (descriptionRef.current && description) {
        const element = descriptionRef.current;
        const lineHeight = parseInt(getComputedStyle(element).lineHeight);
        const maxHeight = lineHeight * 2; // Allow 2 lines
        setShowViewMore(element.scrollHeight > maxHeight);
      }
    };

    if (description) {
      checkTextOverflow();
    }
  }, [description]);
  return (
    <div className="text-black relative">
      {providerProfile?.business_logo && (
        <div className="w-[64px] h-[64px] absolute left-1/2 top-[-45px] -translate-x-1/2 rounded-full shadow-md">
          <img
            src={
              providerProfile?.business_logo
                ? `${import.meta.env.VITE_APP_AWS_URL}/${providerProfile?.business_logo}`
                : ''
            }
            alt=""
            className="h-full w-full object-cover rounded-full border-white border-4"
          />
        </div>
      )}
      <h1 className="text-center text-2xl font-semibold my-[10px] pt-[32px]">
        {providerProfile?.name}
      </h1>
      <div className="text-center text-sm text-[#6c6c6c] mb-[10px] px-4">
        <div
          ref={descriptionRef}
          className={`break-words ${isDescriptionExpanded ? '' : 'line-clamp-3'} [&_a]:text-primary [&_a]:underline hover:[&_a]:text-primary-dark`}
          dangerouslySetInnerHTML={{ __html: description || '' }}
        />
        {showViewMore && (
          <button
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className="text-xs text-primary hover:text-primary-800 mt-2"
          >
            {isDescriptionExpanded ? 'View less' : 'View more'}
          </button>
        )}
      </div>
      <div className="flex items-center justify-center text-[#222222] text-xs mt-[14px]">
        <Star size={11} fill="#222222" />
        <span className="ml-2 ">{providerProfile?.average_rating} </span>
        <span className="ml-2 ">-</span>
        <span className="ml-2 ">{providerProfile?.total_reviews} reviews</span>
        {/* <span className="ml-2 ">-</span>
        <span className="ml-2 ">Provider location</span> */}
      </div>
      
      <div className="flex items-center justify-center space-x-4 mt-5">
        <button
          onClick={handleShare}
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
      {/* <div className="text-[#6c6c6c] text-xs text-center">Provider</div> */}
    </div>
  );
};

export { MobileProfileInfo };
