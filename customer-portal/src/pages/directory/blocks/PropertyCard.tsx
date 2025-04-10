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
          {/* {data?.review_stats && (
            <p className="my-2 px-2 text-center">
              <MessageCircleMore color="#752c84" className="inline-block mx-2" />
              {data?.review_stats ? data?.review_stats?.total_reviews : 0} reviews
            </p>
          )} */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
              <img
                src={
                  data?.business_logo
                    ? `${import.meta.env.VITE_APP_AWS_URL}/${data?.business_logo}`
                    : `${import.meta.env.VITE_APP_AWS_URL}/man-helping-woman-for-carrier.png`
                }
                alt={'Provider Name'}
                className="h-8 w-8 rounded-full object-cover"
              />
              <h3 className="font-medium text-[#222222] text-md truncate max-w-48">
                {data?.name || ''}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-[#222222]" />
              <span>{data?.review_stats ? data?.review_stats?.average_rating : 0}</span>
            </div>
          </div>
          <p className="text-sm text-gray-500">{data?.location || ''}</p>
          {/* <div className="ql-content">
            <div
              className="mt-2 truncate text-[#6a6a6a] text-sm text-pretty"
              dangerouslySetInnerHTML={{ __html: truncateText(data?.description || '', 100) }}
            ></div>
          </div> */}
        </div>
      </Link>
    </div>
  );
}
