import { useAppSelector } from '@/redux/hooks';
import { useAuthContext } from '@/auth';
import { addFavouriteProvider } from '@/services/api/wishlist-favourite';
import { ArrowLeft, Heart, MoveLeft, Share } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import useSharePageUrl from '@/hooks/useShareUrl';
import { Button } from '@/components/ui/button';
import { ClaimListingModal } from '../blocks/ClaimListingModal';

const BannerImgSection = () => {
  const { providerProfile } = useAppSelector((state: any) => state.providerProfile);
  const { auth } = useAuthContext();
  const { sharePage, isShareSupported } = useSharePageUrl();

  const [imgLoaded, setImgLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const imageUrl = providerProfile?.photo_gallery?.[0]
    ? `${import.meta.env.VITE_APP_AWS_URL}/${providerProfile?.photo_gallery?.[0]}`
    : null;

  const [isSticky, setIsSticky] = useState(false);
  const showClaimButton = providerProfile?.imported_from_csv && !providerProfile?.is_claimed;

  useEffect(() => {
    if (providerProfile?.is_favourite) {
      setIsFavorite(providerProfile.is_favourite);
    }
  }, [providerProfile?.is_favourite]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = window.innerHeight * 0.05; // 5% of viewport height
      setIsSticky(scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Debug logging for mobile
  useEffect(() => {
    if (providerProfile) {
      console.log('Mobile BannerImgSection - ProfileData:', {
        id: providerProfile?.id,
        imported_from_csv: providerProfile?.imported_from_csv,
        is_claimed: providerProfile?.is_claimed,
        showClaimButton
      });
    }
  }, [providerProfile, showClaimButton]);

  const toggleFavorite = async () => {
    if (!auth?.token) {
      toast.error('Please log in to favourite this provider.', { position: 'top-right' });
    } else {
      try {
        await addFavouriteProvider(providerProfile?.id, auth?.customer?.id);
        setIsFavorite(!isFavorite);
        toast.success(isFavorite ? 'Removed from favourites' : 'Added to favourites', {
          position: 'top-right'
        });
      } catch (error) {
        toast.error('Failed to update favourite status', { position: 'top-right' });
      }
    }
  };

  return (
    <>
      <ClaimListingModal
        open={isClaimModalOpen}
        onOpenChange={() => setIsClaimModalOpen(!isClaimModalOpen)}
        companyId={providerProfile?.id}
      />
      <div className="relative h-[200px] w-full max-w-full">
        {!imgLoaded && imageUrl && <div className="w-full h-full bg-gray-200 animate-pulse" />}

        {/* Render image if available */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              imgLoaded ? 'opacity-100' : 'opacity-0 absolute'
            }`}
          />
        )}

        {/* If imageUrl is null (no image), show static skeleton */}
        {!imageUrl && <div className="w-full h-full bg-gray-200 animate-pulse" />}

        {/* Claim Listing Button - Bottom Right Corner for Mobile */}
        {showClaimButton && (
          <Button
            onClick={() => setIsClaimModalOpen(true)}
            className="absolute bottom-3 right-3 bg-primary text-white hover:bg-primary-dark text-xs px-3 py-1 h-auto rounded-md shadow-lg z-40"
          >
            Claim Listing
          </Button>
        )}

      <div
        className={`top-1 left-4 w-full transition-all duration-300 z-50 ${
          isSticky ? 'fixed' : 'absolute'
        }`}
      >
        <div className="flex justify-between items-center">
          <div
            className="backdrop-[#dedede] shadow-sm backdrop-blur-md p-3 rounded-full"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={18} className=" text-black" />
          </div>
          <div className="flex me-7 gap-2">
            <button
              className="backdrop-[#dedede] shadow-sm backdrop-blur-md p-3 rounded-full"
              onClick={() => sharePage}
            >
              <Share size={18} strokeWidth={2} className=" text-black" />
            </button>
            <div
              className="backdrop-[#dedede] shadow-sm backdrop-blur-md p-3 rounded-full cursor-pointer hover:bg-white/20 transition-colors"
              onClick={toggleFavorite}
            >
              <Heart
                size={18}
                strokeWidth={2}
                className={cn(
                  'transition-colors duration-200',
                  isFavorite ? 'fill-red-500 stroke-red-500' : 'stroke-black fill-transparent'
                )}
              />
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export { BannerImgSection };
