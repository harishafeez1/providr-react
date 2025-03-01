import clsx from 'clsx';
import { Heart, Star } from 'lucide-react';
import { useState } from 'react';

export function PropertyCard({ data }: any) {
  const [isFavorite, setIsFavorite] = useState(false);
  return (
    <div className="">
      <div className="relative aspect-square overflow-hidden rounded-xl">
        <img
          src={`${import.meta.env.VITE_APP_AWS_URL}/${data?.business_logo}`}
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
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{data?.name}</h3>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-current" />
            <span>{4.5}</span>
          </div>
        </div>
        <p className="text-sm text-gray-500">{''}</p>
        <p className="text-sm text-gray-500">{data?.description || ''}</p>
        <p className="mt-2"></p>
      </div>
    </div>
  );
}
