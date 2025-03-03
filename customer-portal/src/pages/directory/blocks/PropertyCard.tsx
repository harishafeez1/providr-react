import clsx from 'clsx';
import { Heart, MessageCircleMore, Star } from 'lucide-react';
import { useState } from 'react';

export function PropertyCard({ data }: any) {
  const [isFavorite, setIsFavorite] = useState(false);
  return (
    <>
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
            className={clsx('h-6 w-6', isFavorite ? 'fill-red-500 stroke-red-500' : 'stroke-white')}
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
          <h3 className="font-medium truncate pe-2">{data?.name || ''}</h3>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-current" />
            <span>{data?.review_stats ? data?.review_stats?.average_rating : 0}</span>
          </div>
        </div>
        <p className="text-sm text-gray-500">{data?.location || ''}</p>
        <p className="text-sm text-gray-500">{data?.description || ''}</p>
        <div className="px-10">
          {data?.provider_company ? (
            <p className="mt-2 rounded-full bg-success-clarity px-2 py-1 text-xs text-success text-center">
              Already Contacted
            </p>
          ) : (
            <p className="mt-2 rounded-full bg-primary-clarity px-2 py-1 text-xs text-white text-center">
              Contact You Soon
            </p>
          )}
        </div>
      </div>
    </>
  );
}
