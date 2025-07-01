import { useAppSelector } from '@/redux/hooks';
import { ArrowLeft, Heart, MoveLeft, Share } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const BannerImgSection = () => {
  const { providerProfile } = useAppSelector((state: any) => state.providerProfile);

  const [imgLoaded, setImgLoaded] = useState(false);
  const imageUrl = providerProfile?.photo_gallery?.[0]
    ? `${import.meta.env.VITE_APP_AWS_URL}/${providerProfile?.photo_gallery?.[0]}`
    : null;

  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = window.innerHeight * 0.05; // 5% of viewport height
      setIsSticky(scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
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
            <div className="backdrop-[#dedede] shadow-sm backdrop-blur-md p-3 rounded-full">
              <Share size={18} strokeWidth={2} className=" text-black" />
            </div>
            <div className="backdrop-[#dedede] shadow-sm backdrop-blur-md p-3 rounded-full">
              <Heart size={18} strokeWidth={2} className=" text-black" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { BannerImgSection };
