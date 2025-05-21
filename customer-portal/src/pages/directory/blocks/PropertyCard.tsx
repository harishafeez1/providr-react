import { StarRating } from '@/components';
import clsx from 'clsx';
import { Heart, MessageCircleMore, Star } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function PropertyCard({ data }: any) {
  const [isFavorite, setIsFavorite] = useState(false);
  const truncateText = (htmlString: string, length: number) => {
    const text = new DOMParser().parseFromString(htmlString, 'text/html').body.textContent || '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  return (
    <div className="cursor-pointers">
      <Link to={`/provider-profile/${data?.id}`}>
        <div className="relative overflow-hidden rounded-xl aspect-square">
          <img
            src={
              data?.photo_gallery?.[0]
                ? `${import.meta.env.VITE_APP_AWS_URL}/${data?.photo_gallery?.[0]}`
                : `${import.meta.env.VITE_APP_AWS_URL}/man-helping-woman-for-carrier.png`
            }
            alt={'provider name'}
            className="h-full w-full object-cover"
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
                isFavorite ? 'fill-red-500 stroke-red-500' : 'stroke-white fill-transparent '
              )}
            />
          </button>
        </div>
        <div className="mt-4">
          <div className="flex flex-col gap-1">
            <div className="font-semibold truncate text-black">{data?.name || ''}</div>

            <StarRating initialRating={5} size={18} isDisabled />
          </div>
        </div>
      </Link>
    </div>
  );
}
