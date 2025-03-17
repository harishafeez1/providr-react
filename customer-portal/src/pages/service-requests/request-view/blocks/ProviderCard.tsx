import { Button } from '@/components/ui/button';
import { setServiceRequest } from '@/redux/slices/service-request-slice';
import { store } from '@/redux/store';
import { getConnectedProvider } from '@/services/api/service-requests';
import clsx from 'clsx';
import { Heart, MessageCircleMore, Phone, Star } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const ProviderCard = ({ data, comapnyId }: any) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleProviderConnection = async () => {
    const res = await getConnectedProvider(data?.id, data?.pivot?.service_request_id);
    if (res) {
      store.dispatch(setServiceRequest(res));
    }
  };

  return (
    <div className="cursor-pointer">
      {comapnyId == null || comapnyId == '' ? (
        <Button onClick={handleProviderConnection} className="w-full" size={'lg'}>
          Connect
        </Button>
      ) : comapnyId !== null ? (
        <div
          className={`text-center badge ${data?.pivot?.status === 'Completed' ? 'badge-success' : ''}`}
        >
          {data?.pivot?.status}
        </div>
      ) : (
        ''
      )}
      <Link to={`/provider-profile/${data?.id}`}>
        <div className="w-full px-2"></div>
        <div className="relative aspect-square overflow-hidden rounded-xl">
          <img
            src={
              data?.business_logo
                ? `${import.meta.env.VITE_APP_AWS_URL}/${data?.business_logo}`
                : data?.imageUrl
            }
            alt={'company name'}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsFavorite(!isFavorite);
            }}
            className="absolute right-3 top-3 rounded-full p-2 transition hover:bg-white/10"
          >
            <Heart
              className={clsx(
                'h-6 w-6',
                isFavorite ? 'fill-red-500 stroke-red-500' : 'stroke-white'
              )}
            />
          </button>
        </div>
        <div className="mt-2">
          {data?.review_stats && (
            <p className="my-2 px-2 text-center">
              <MessageCircleMore color="#752c84" className="inline-block mx-2" />
              {data?.review_stats ? data?.review_stats?.total_reviews : 0} reviews
            </p>
          )}
          <div className="flex items-center justify-between">
            <h3 className="font-medium truncate pe-">{data?.name || ''}</h3>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-current" />
              <span>{data?.review_stats ? data?.review_stats?.average_rating : 0}</span>
            </div>
          </div>
          <p className="text-sm text-gray-500">{data?.location || ''}</p>
          <p className="text-sm text-gray-500 truncate py-2">{data?.description || ''}</p>
          {data?.pivot?.customer_contacted === 1 ? (
            <div className="px-10">
              <p className="mt-2 flex gap-4 rounded-full bg-success-clarity px-2 py-1 text-xs text-success text-center">
                <Phone size={16} />
                Already Contacted
              </p>
            </div>
          ) : (
            <div className="px-10">
              <p className="mt-2 flex gap-4  rounded-full bg-primary-clarity px-2 py-1 text-xs text-white text-center">
                <Phone size={16} />
                Contact You Soon
              </p>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export { ProviderCard };
