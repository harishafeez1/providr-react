import { format } from 'date-fns';
import { Star, MessageCircle } from 'lucide-react';
import PlaceholderImg from '../../../../../public/media/avatars/blank.png';
import { useAppSelector } from '@/redux/hooks';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { BottomSheetDialog } from '@/components';

const ExpandableText = ({
  text,
  maxLength = 100,
  className = ''
}: {
  text: string;
  maxLength?: number;
  className?: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = text.length > maxLength;

  if (!shouldTruncate) {
    return <p className={className}>{text}</p>;
  }

  return (
    <div className="space-y-2">
      <p className={className}>
        {isExpanded ? text : `${text.substring(0, maxLength)}...`}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-primary text-xs font-medium hover:text-primary-500 underline"
      >
        {isExpanded ? 'Show less' : 'View more'}
      </button>
    </div>
  );
};

const MobileReviews = () => {
  const { providerProfile } = useAppSelector((state: any) => state.providerProfile);

  // Missing variables from desktop version now available
  const averageRating = providerProfile?.average_rating;
  const totalReviews = providerProfile?.total_reviews;

  const [isOpen, setIsOpen] = useState(false);
  const handleModalChange = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div id="reviews" className="">
      <BottomSheetDialog open={isOpen} onOpenChange={handleModalChange} className="h-[97vh]">
        <div className="max-h-[95vh] overflow-y-auto">
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-8">
            <Star fill="black" />
            <span className="">{providerProfile?.review_stats?.average_rating || 5}</span>
          </h1>
          <h1 className="text-xl font-semibold pb-[34px]">
            {providerProfile?.review_stats?.total_reviews || 0} reviews
          </h1>
          {providerProfile?.reviews?.map((item: any) => (
            <div key={item.id} className="text-sm pb-6">
              <div className="flex gap-4">
                <img src={PlaceholderImg} alt="" className="w-10 h-10 rounded-full" />
                <div className="flex items-center mb-4">
                  <div>
                    <h3 className="font-semibold text-sm">{`${item.customer.first_name} ${item.customer.last_name || ''}`}</h3>
                    <p className="text-gray-500 text-xs">{format(item.created_at, 'dd MM yyyy')}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center mt-2">
                {Array.from({ length: Math.floor(item?.rating || 0) }).map((_, index) => (
                  <Star key={index} fill="#222222" size={10} />
                ))}
              </div>
              <div className="mt-4">
                <ExpandableText
                  text={item.content || ''}
                  maxLength={200}
                  className="text-[#222222] text-sm"
                />
              </div>

              {/* Provider Reply */}
              {item.reply && (
                <div className="mt-4 bg-gray-50 rounded-lg p-3 border-l-2 border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle size={16} className="text-gray-600" />
                    <span className="text-xs font-medium text-black">Provider Reply</span>
                    <span className="text-xs text-gray-500">
                      {format(item.reply.created_at, 'dd MM yyyy')}
                    </span>
                  </div>
                  <ExpandableText
                    text={item.reply.content}
                    maxLength={150}
                    className="text-sm text-gray-700 leading-relaxed"
                  />
                </div>
              )}

              <div className="border-b border-gray-200 my-4"></div>
            </div>
          ))}
        </div>
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
              <div className="self-start">
                <ExpandableText
                  text={item.content || ''}
                  maxLength={120}
                  className="text-sm break-all"
                />
              </div>

              {/* Provider Reply */}
              {item.reply && (
                <div className="mt-3 bg-gray-50 rounded-lg p-3 border-l-2 border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle size={12} className="text-gray-600" />
                    <span className="text-xs font-medium text-black">Provider Reply</span>
                    <span className="text-xs text-gray-500">
                      {format(item.reply.created_at, 'MMM dd')}
                    </span>
                  </div>
                  <ExpandableText
                    text={item.reply.content}
                    maxLength={80}
                    className="text-xs text-gray-700 leading-relaxed break-all"
                  />
                </div>
              )}

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

      {providerProfile?.total_reviews > 0 && (
        <Button
          className="w-full font-semibold text-black bg-[#F2F2F2] hover:bg-[#F7F7F7] transition mt-4"
          onClick={handleModalChange}
        >
          Show all reviews
        </Button>
      )}
    </div>
  );
};

export { MobileReviews };
