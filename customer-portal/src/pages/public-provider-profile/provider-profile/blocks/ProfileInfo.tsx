import { Facebook, Heart, Instagram, Share, Star, Twitter } from 'lucide-react';
import NDIS from '/media/brand-logos/NDIS-Provider.png';

const ProfileInfo = ({ ProfileData }: any) => {
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
        <div className="w-[140px] h-[140px] overflow-hidden absolute left-14 top-28">
          <img
            src={
              ProfileData?.photo_gallery?.[0]
                ? `${import.meta.env.VITE_APP_AWS_URL}/${ProfileData?.photo_gallery?.[0]}`
                : ''
            }
            alt=""
            className="h-full w-full object-cover rounded-full"
          />
        </div>
      </div>
      <div className="text-2xl font-semibold mt-20 break-words w-80 flex justify-center">
        Lumi Support PRC
      </div>
      <div className="flex items-center my-2">
        <Star size={20} className="text-black mb-1" />
        <span className="ml-2 text-lg font-bold">{ProfileData?.average_rating} </span>
        <span className="ml-2 text-lg font-bold">-</span>
        <span className="ml-2 text-lg font-bold">{ProfileData?.total_reviews} reviews</span>
      </div>
      <div className="flex items-center space-x-4 mt-2">
        <button
          className="flex items-center font-medium hover:underline"
          //   onClick={sharePage}
        >
          <Share size={20} className="text-black font-bold" />
        </button>
        <button
          //   onClick={toggleFavorite}
          className="flex items-center font-medium hover:underline"
        >
          <Heart size={20} className="text-black font-bold" />
        </button>
      </div>
      <div className="flex items-center space-x-6 mt-6">
        <Facebook size={30} fill="#fff" strokeWidth={1} className="bg-black rounded-full p-1" />
        <Instagram
          size={30}
          color="#ffffff"
          strokeWidth={2}
          className="bg-black rounded-full p-[6px]"
        />
        <Twitter size={30} fill="#fff" strokeWidth={1} className="bg-black rounded-full p-1" />
      </div>

      <div className="my-6">
        <img src={NDIS} alt="NDIS Registered" />
      </div>

      <p className="text-[#7B7171] px-4 lg:px-20 mb-4 md:mb-0 mt-16">
        Transforming you backyards into cozy outdoor spaces has never been easier with Must Have
        Maintenance at your service! As a family-owned landscaping company, we understand that your
        outdoor space is more than just a yard. It is an extension of your home where you can relax
        and unwind. Our team of experts will work with you to create a landscape design that suits
        your style, meets your needs, and fits your budget. We offer a variety of services,
        including garden maintenance, turf installation, backyard landscaping, and construction. Let
        our expert team help you turn your space into the outdoor area of your dreams!
      </p>
    </div>
  );
};

export { ProfileInfo };
