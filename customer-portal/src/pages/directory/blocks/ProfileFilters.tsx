import React from 'react';
import { Heart } from 'lucide-react';

interface PropertyCardProps {
  title: string;
  location: string;
  price: number;
  rating: number;
  images: string[];
  dates: string;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  title,
  location,
  price,
  rating,
  images,
  dates
}) => {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-square overflow-hidden rounded-xl">
        <img
          src={images[0]}
          alt={title}
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
        <button className="absolute top-3 right-3 p-2">
          <Heart className="h-6 w-6 text-white stroke-[2] fill-transparent hover:fill-red-500 transition-colors" />
        </button>
      </div>

      <div className="mt-2">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-900">{location}</h3>
          <div className="flex items-center space-x-1">
            <svg viewBox="0 0 32 32" aria-hidden="true" className="h-4 w-4 fill-current">
              <path d="M15.094 1.579l-4.124 8.885-9.86 1.27a1 1 0 0 0-.542 1.736l7.293 6.565-1.965 9.852a1 1 0 0 0 1.483 1.061L16 25.951l8.625 4.997a1 1 0 0 0 1.482-1.06l-1.965-9.853 7.293-6.565a1 1 0 0 0-.541-1.735l-9.86-1.271-4.127-8.885a1 1 0 0 0-1.814 0z" />
            </svg>
            <span>{rating}</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">{dates}</p>
        <p className="text-sm text-gray-500 mt-1">{title}</p>
        <p className="mt-2">
          <span className="font-semibold">${price}</span>
          <span className="text-gray-500"> night</span>
        </p>
      </div>
    </div>
  );
};

export default PropertyCard;
