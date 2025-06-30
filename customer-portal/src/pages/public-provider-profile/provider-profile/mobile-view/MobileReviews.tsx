import { format } from 'date-fns';
import { Star } from 'lucide-react';
import PlaceholderImg from '../../../../../public/media/avatars/blank.png';
import { useAppSelector } from '@/redux/hooks';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const MobileReviews = () => {
  const { providerProfile } = useAppSelector((state: any) => state.providerProfile);
  return (
    <div id="reviews" className="">
      <div className="flex items-center mb-6">
        <Star size={20} fill="#262626" className="text-black" />
        <span className="ml-2 text-xl font-semibold">
          {providerProfile?.average_rating} {' - '}
        </span>

        <span className="ml-2 text-xl font-semibold">{providerProfile?.total_reviews} reviews</span>
      </div>

      <ScrollArea className="h-[200px] w-[90vw]">
        {/* <div className="flex">
          {providerProfile?.reviews?.map((item: any) => (
            <div key={item.id} className="text-sm pb-6">
              <div className="flex gap-4">
                <img src={PlaceholderImg} alt="" className="w-10 h-10 rounded-full" />
                <div className="flex items-center mb-4">
                  <div>
                    <h3 className="font-semibold text-sm">{`${item.customer.first_name} ${item.customer.last_name || ''}`}</h3>
                    <p className="text-gray-500 text-sm">{format(item.created_at, 'dd MM yyyy')}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.floor(item?.rating || 0) }).map((_, index) => (
                  <Star key={index} fill="#222222" size={10} />
                ))}
              </div>
              <p className="text-[#222222] mt-4 text-sm line-clamp-4">{item.content || ''}</p>
            </div>
          ))}
        </div> */}
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export { MobileReviews };
