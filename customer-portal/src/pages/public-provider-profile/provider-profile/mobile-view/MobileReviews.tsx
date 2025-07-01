import { format } from 'date-fns';
import { Star } from 'lucide-react';
import PlaceholderImg from '../../../../../public/media/avatars/blank.png';
import { useAppSelector } from '@/redux/hooks';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { BottomSheetDialog } from '@/components';

const MobileReviews = () => {
  const { providerProfile } = useAppSelector((state: any) => state.providerProfile);

  const [isOpen, setIsOpen] = useState(false);
  const handleModalChange = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div id="reviews" className="">
      <BottomSheetDialog open={isOpen} onOpenChange={handleModalChange} className="h-[98vh]">
        <div className="">content goes here</div>
      </BottomSheetDialog>
      <div className="flex items-center mb-8">
        <Star size={18} fill="#262626" className="text-black" />
        <span className="ml-2 text-xl font-semibold">
          {providerProfile?.average_rating} {' - '}
        </span>

        <span className="ml-2 text-xl font-semibold">{providerProfile?.total_reviews} reviews</span>
      </div>

      <ScrollArea className="max-w-[85vw] h-auto ">
        <div className="flex h-full flex-nowrap w-max pb-4">
          {providerProfile?.reviews?.map((item: any, index: number) => (
            <div key={item.id} className="relative flex gap-3 flex-col w-[70vw] px-6 max-h-full">
              <div className="flex max-w-[60vw] items-center">
                <div className="flex mr-2">
                  {Array.from({ length: Math.floor(item?.rating || 0) }).map((_, idx) => (
                    <Star key={idx} fill="#222222" size={10} />
                  ))}
                </div>
                <div className="mr-2">-</div>
                <div className="text-[#6c6c6c] text-xs">
                  {item?.created_at ? format(item.created_at, 'MMMM dd, yyyy') : ''}
                </div>
              </div>
              <div className="text-sm break-all line-clamp-5 self-start">{item.content || ''}</div>

              {/* Vertical separator on the right side */}
              {index < providerProfile.reviews.length - 1 && (
                <div className="absolute right-0 top-0 h-full w-[1px] bg-gray-200"></div>
              )}

              <div className="mt-auto">
                <img src={PlaceholderImg} alt="" className="w-10 h-10 rounded-full" />
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="" />
      </ScrollArea>

      <Button
        className="w-full font-semibold text-black bg-[#F2F2F2] hover:bg-[#F7F7F7] transition mt-4"
        onClick={handleModalChange}
      >
        Show all reviews
      </Button>
    </div>
  );
};

export { MobileReviews };
