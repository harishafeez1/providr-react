import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Heart,
  Star,
  Share,
  MapPin,
  Calendar,
  Users,
  Home,
  Wifi,
  Car,
  Utensils,
  Snowflake,
  Phone,
  Mail,
  Globe,
  Facebook,
  Instagram
} from 'lucide-react';

import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ConnectProviderModal } from './ConnectProviderModal';

interface ProviderDetailPageProps {
  data: any;
  loading: boolean;
}

const ProviderDetailPage: React.FC<ProviderDetailPageProps> = ({ data, loading }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  function ListingSkeleton() {
    return (
      <div className="animate-pulse">
        <div className="h-[400px] bg-gray-200 rounded-xl mb-6"></div>
      </div>
    );
  }

  function GridListingSkeleton() {
    return (
      <div className="col-span-2">
        <div className="animate-pulse">
          <div className="h-[190px] w-full bg-gray-200 rounded-xl mb-6"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-[190px] bg-gray-200 rounded-xl mb-6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ConnectProviderModal open={isModalOpen} onOpenChange={handleModalClose} />
      {/* Property title section */}
      <div className="container mx-auto px-4 pt-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{data?.name || ''}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center text-sm font-medium hover:underline">
              <Share size={16} className="mr-1" />
              Share
            </button>
            <button
              onClick={toggleFavorite}
              className="flex items-center text-sm font-medium hover:underline"
            >
              <Heart
                size={16}
                className={`mr-1 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
              />
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Photo gallery */}
      <div className="container mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-1 gap-2 rounded-xl overflow-hidden">
          {/* Large Main Image */}
          <div className="md:row-span-2 md:col-span-2 h-full">
            {loading ? (
              <ListingSkeleton />
            ) : (
              <img
                src={
                  data?.photo_gallery?.[0]
                    ? `${import.meta.env.VITE_APP_AWS_URL}/${data?.photo_gallery?.[0]}`
                    : !loading && !data?.photo_gallery?.[0]
                      ? `${import.meta.env.VITE_APP_AWS_URL}/man-helping-woman-for-carrier.png`
                      : ''
                }
                alt="company details"
                className="w-full object-contain rounded-lg h-[400px]"
                loading="lazy"
              />
            )}
          </div>

          {/* Smaller Images */}

          {loading ? (
            <GridListingSkeleton />
          ) : (
            data?.photo_gallery?.slice(1, 5)?.map((image: any, index: number) => (
              <div key={index} className="h-full">
                <img
                  src={
                    image
                      ? `${import.meta.env.VITE_APP_AWS_URL}/${image}`
                      : `${import.meta.env.VITE_APP_AWS_URL}/man-helping-woman-for-carrier.png`
                  }
                  alt="details"
                  className="w-full object-contain rounded-lg h-[400px]"
                  loading="lazy"
                />
              </div>
            ))
          )}
        </div>
      </div>
      {/* Main content */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left column - Property details */}
          <div className="lg:col-span-2">
            <div className="border-b pb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">{data?.name || ''}</h2>
                </div>
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img
                    src={
                      data?.business_logo
                        ? `${import.meta.env.VITE_APP_AWS_URL}/${data?.business_logo}`
                        : `${import.meta.env.VITE_APP_AWS_URL}/man-helping-woman-for-carrier.png`
                    }
                    alt={'company details'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            {/* Host highlights */}
            <div className="py-6">
              <h2 className="text-xl font-bold mb-2">Services</h2>
              <div className="py-6 border-b">
                <div className="grid grid-cols-1 gap-4 backdrop:gap-4">
                  {data?.service_offerings?.map((item: any) => (
                    <div key={item.id} className="flex gap-2 items-start">
                      <div className="space-y-2 mr-4">
                        {item.service.service_icon ? (
                          <div
                            className="h-10 w-12"
                            dangerouslySetInnerHTML={{ __html: item.service.service_icon }}
                          ></div>
                        ) : (
                          ''
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{item?.service?.name || ''}</h3>
                        <p className="text-gray-600 text-sm">{item?.description || ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="py-6 border-b">
              <h2 className="text-xl font-bold mb-4">About</h2>
              <div className="ql-content">
                <div
                  className="mt-4"
                  dangerouslySetInnerHTML={{ __html: data?.description || '' }}
                ></div>
              </div>
              {/* <button className="mt-4 font-medium underline">Show more</button> */}
            </div>
          </div>

          {/* Right column - Booking widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 border rounded-xl p-6 shadow-lg">
              <div className="flex justify-center flex-col gap-4 mb-4">
                <Button variant={'destructive'} size={'sm'} onClick={handleModalOpen}>
                  Connect with this provider
                </Button>
                <Button variant={'outline'} size={'sm'}>
                  Write A Review
                </Button>

                <div className="flex gap-6 justify-center items-center border card-rounded p-2">
                  <Phone className="text-primary" size={16} />
                  <span className="text-sm">{data?.company_phone || 'N/A'}</span>
                </div>
                <div className="flex gap-6 justify-center items-center border card-rounded p-2">
                  <Mail className="text-primary" size={16} />
                  <span className="text-sm">{data?.company_email || 'N/A'}</span>
                </div>
                <div className="flex gap-6 justify-center items-center border card-rounded p-2">
                  <Globe className="text-primary" size={16} />
                  <span className="text-sm">{data?.company_website || 'N/A'}</span>
                </div>

                <div className="flex justify-around">
                  <Facebook className="text-primary" size={22} />
                  <Instagram className="text-primary" size={22} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <div id="reviews" className="container mx-auto px-4 py-12">
        <div className="flex items-center mb-6">
          <Star size={20} className="text-black" />
          <span className="ml-2 text-xl font-bold">{data?.total_reviews} reviews</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Review cards would go here */}
          {data?.reviews?.map((item: any) => (
            <div key={item.id} className="border-b pb-6">
              <div className="flex items-center mb-4">
                <div>
                  <h3 className="font-medium">{`${item.customer.first_name} ${item.customer.last_name || ''}`}</h3>
                  <p className="text-gray-500 text-sm">{format(item.created_at, 'dd MM yyyy')}</p>
                </div>
              </div>
              <p className="text-gray-700">{item.content || ''}</p>
            </div>
          ))}
        </div>

        {/* <button className="mt-8 px-6 py-2 border border-gray-900 rounded-lg font-medium">
          Show all 73 reviews
        </button> */}
      </div>
    </div>
  );
};

export default ProviderDetailPage;
