import { useAppSelector } from '@/redux/hooks';
import { Star } from 'lucide-react';

const MobileProfileInfo = () => {
  const { providerProfile } = useAppSelector((state: any) => state.providerProfile);
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
      <p className="text-center text-sm text-[#6c6c6c] mb-[10px]">
        Enjoy playful interpretations of classic American, French, Italian, and German cuisine.
      </p>
      <div className="flex items-center justify-center text-[#222222] text-xs mt-[14px]">
        <Star size={11} fill="#222222" />
        <span className="ml-2 ">{providerProfile?.average_rating} </span>
        <span className="ml-2 ">-</span>
        <span className="ml-2 ">{providerProfile?.total_reviews} reviews</span>
        <span className="ml-2 ">-</span>
        <span className="ml-2 ">Provider location</span>
      </div>
      <div className="text-[#6c6c6c] text-xs text-center">Provider</div>
    </div>
  );
};

export { MobileProfileInfo };
