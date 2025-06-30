import { useAppSelector } from '@/redux/hooks';
import { ArrowLeft, Heart, MoveLeft, Share } from 'lucide-react';
import React, { useState } from 'react';

const BannerImgSection = () => {
  const { providerProfile } = useAppSelector((state: any) => state.providerProfile);

  const [imgLoaded, setImgLoaded] = useState(false);
  const imageUrl = providerProfile?.photo_gallery?.[0]
    ? `${import.meta.env.VITE_APP_AWS_URL}/${providerProfile?.photo_gallery?.[0]}`
    : null;

  return (
    <div className="relative h-[200px]">
      {!imgLoaded && imageUrl && <div className="w-full h-full bg-gray-200 animate-pulse" />}

      {/* Render image if available */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover block transition-opacity duration-500 ${
            imgLoaded ? 'opacity-100' : 'opacity-0 absolute'
          }`}
        />
      )}

      {/* If imageUrl is null (no image), show static skeleton */}
      {!imageUrl && <div className="w-full h-full bg-gray-200 animate-pulse" />}

      <div className="absolute top-1 left-4 w-full">
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
