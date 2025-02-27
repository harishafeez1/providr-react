import clsx from 'clsx';
import { Heart, Star } from 'lucide-react';
import { useState } from 'react';

interface PropertyCardProps {
  imageUrl: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  dates: string;
}

export function PropertyCard({
  imageUrl,
  title,
  location,
  price,
  rating,
  dates
}: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="">
      <div className="relative aspect-square overflow-hidden rounded-xl">
        <img
          src={imageUrl}
          alt={title}
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
          <h3 className="font-medium">{title}</h3>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-current" />
            <span>{rating}</span>
          </div>
        </div>
        <p className="text-sm text-gray-500">{location}</p>
        <p className="text-sm text-gray-500">{dates}</p>
        <p className="mt-2"></p>
      </div>
    </div>
  );
}
