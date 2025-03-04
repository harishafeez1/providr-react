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
import { Premises } from './Premises';
import { it } from 'node:test';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface ProviderDetailPageProps {
  data: any;
}

const ProviderDetailPage: React.FC<ProviderDetailPageProps> = ({ data }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF5A5F]"></div>
      </div>
    );
  }

  const amenityIcons: Record<string, React.ReactNode> = {
    Wifi: <Wifi size={20} />,
    Kitchen: <Utensils size={20} />,
    Pool: (
      <div className="relative w-5 h-5">
        <div className="absolute inset-0 border-2 border-current rounded-sm"></div>
        <div className="absolute inset-1/3 bottom-0 border-t-2 border-current"></div>
      </div>
    ),
    'Free parking': <Car size={20} />,
    'Beach access': (
      <div className="relative w-5 h-5">
        <div className="absolute bottom-0 left-0 right-0 h-2 border-t-2 border-current"></div>
        <div className="absolute bottom-2 left-1/4 right-1/4 h-1 border-t-2 border-current"></div>
      </div>
    ),
    Gym: (
      <div className="relative w-5 h-5">
        <div className="absolute inset-y-2 left-0 right-0 border-2 border-current rounded-full"></div>
        <div className="absolute inset-x-0 top-0 h-2 border-b-2 border-current"></div>
      </div>
    ),
    'Washer/Dryer': (
      <div className="relative w-5 h-5">
        <div className="absolute inset-0 border-2 border-current rounded-full"></div>
        <div className="absolute inset-1/4 border-2 border-current rounded-full"></div>
      </div>
    ),
    Doorman: <Users size={20} />,
    Fireplace: (
      <div className="relative w-5 h-5">
        <div className="absolute bottom-0 left-0 right-0 h-3 border-2 border-current"></div>
        <div className="absolute bottom-3 left-1/4 right-1/4 h-2 border-t-2 border-l-2 border-r-2 border-current"></div>
      </div>
    ),
    'Hot tub': (
      <div className="relative w-5 h-5">
        <div className="absolute inset-0 border-2 border-current rounded-md"></div>
        <div className="absolute inset-x-1 top-1 h-1 border-b-2 border-current"></div>
      </div>
    ),
    'Ski-in/Ski-out': (
      <div className="relative w-5 h-5">
        <div className="absolute inset-y-0 left-1 w-1 border-r-2 border-current transform -rotate-12"></div>
        <div className="absolute inset-y-0 right-1 w-1 border-l-2 border-current transform rotate-12"></div>
      </div>
    ),
    'Air conditioning': <Snowflake size={20} />,
    'Breakfast included': (
      <div className="relative w-5 h-5">
        <div className="absolute inset-x-0 top-1 h-1 border-t-2 border-current"></div>
        <div className="absolute inset-x-0 bottom-1 h-1 border-t-2 border-current"></div>
      </div>
    ),
    Elevator: (
      <div className="relative w-5 h-5">
        <div className="absolute inset-0 border-2 border-current"></div>
        <div className="absolute inset-x-1 inset-y-1 border-2 border-current"></div>
      </div>
    ),
    'City views': (
      <div className="relative w-5 h-5">
        <div className="absolute bottom-0 left-0 w-1 h-3 border-r-2 border-current"></div>
        <div className="absolute bottom-0 left-2 w-1 h-4 border-r-2 border-current"></div>
        <div className="absolute bottom-0 right-2 w-1 h-2 border-r-2 border-current"></div>
        <div className="absolute bottom-0 right-0 w-1 h-3 border-r-2 border-current"></div>
      </div>
    ),
    'Fire pit': (
      <div className="relative w-5 h-5">
        <div className="absolute bottom-0 inset-x-0 h-2 border-2 border-current rounded-sm"></div>
        <div className="absolute bottom-2 left-1/4 right-1/4 h-1 border-t-2 border-l-2 border-r-2 border-current"></div>
      </div>
    ),
    Stargazing: (
      <div className="relative w-5 h-5">
        <div className="absolute inset-2 border-2 border-current rounded-full"></div>
        <div className="absolute left-0 top-0 w-1 h-1 border-r-2 border-b-2 border-current"></div>
        <div className="absolute right-0 top-0 w-1 h-1 border-l-2 border-b-2 border-current"></div>
        <div className="absolute left-0 bottom-0 w-1 h-1 border-r-2 border-t-2 border-current"></div>
        <div className="absolute right-0 bottom-0 w-1 h-1 border-l-2 border-t-2 border-current"></div>
      </div>
    ),
    Kayaks: (
      <div className="relative w-5 h-5">
        <div className="absolute inset-x-0 bottom-1 h-1 border-t-2 border-current"></div>
        <div className="absolute inset-x-1/4 top-1 bottom-2 border-2 border-current rounded-t-full"></div>
      </div>
    ),
    'Lake access': (
      <div className="relative w-5 h-5">
        <div className="absolute bottom-0 inset-x-0 h-2 border-t-2 border-current"></div>
        <div className="absolute bottom-2 inset-x-1/4 h-1 border-t-2 border-current"></div>
      </div>
    ),
    Concierge: <Users size={20} />
  };

  return (
    <div className="min-h-screen bg-white">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-xl overflow-hidden">
          <div className="aspect-auto md:row-span-2 md:col-span-2">
            <img
              src={`${import.meta.env.VITE_APP_AWS_URL}/${data?.photo_gallery?.[0]}`}
              alt={'name'}
              className="w-full h-full object-cover"
            />
          </div>
          {data?.photo_gallery?.slice(1)?.map((image: any) => (
            <div className="aspect-[1] md:aspect-square">
              <img
                src={`${import.meta.env.VITE_APP_AWS_URL}/${image}`}
                alt={`name`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}

          {/* {property.images.slice(1).map((image: string, index: number) => (
            <div key={index} className="aspect-[4/3] md:aspect-square">
              <img
                src={image}
                alt={`${property.title} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))} */}
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
                    src={`${import.meta.env.VITE_APP_AWS_URL}/${data?.business_logo}`}
                    alt={'host name'}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Host highlights */}
            <div className="py-6 border-b">
              <h2 className="text-xl font-bold mb-2">Services</h2>
              <div className="py-6 border-b">
                <div className="grid grid-cols-1 backdrop:gap-4">
                  {data?.service_offerings?.map((item: any) => (
                    <div key={item.id} className="flex items-start">
                      <div className="mt-1 mr-4">
                        <Home size={24} />
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
              <p className="text-gray-700 leading-relaxed mt-4">{data?.description || ''}</p>
              {/* <button className="mt-4 font-medium underline">Show more</button> */}
            </div>
          </div>

          {/* Right column - Booking widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 border rounded-xl p-6 shadow-lg">
              <div className="flex justify-center flex-col gap-4 mb-4">
                <Button variant={'destructive'} size={'sm'}>
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
