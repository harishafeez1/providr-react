import { useState } from 'react';
import { format } from 'date-fns';
import { Star, MessageCircle } from 'lucide-react';
import PlaceholderImg from '../../../../../public/media/avatars/blank.png';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle
} from '@/components/ui/dialog';

const Reviews = ({ data }: any) => {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewContent, setViewContent] = useState({ title: '', content: '' });

  const handleViewMore = (title: string, content: string) => {
    setViewContent({ title, content });
    setIsViewModalOpen(true);
  };

  const TruncatedText = ({
    text,
    title,
    maxLength = 100,
    className = ''
  }: {
    text: string;
    title: string;
    maxLength?: number;
    className?: string;
  }) => {
    const shouldTruncate = text.length > maxLength;

    if (!shouldTruncate) {
      return <p className={className}>{text}</p>;
    }

    const truncatedText = text.substring(0, maxLength);

    return (
      <div className="space-y-2">
        <p className={className}>{truncatedText}...</p>
        <button
          onClick={() => handleViewMore(title, text)}
          className="text-primary text-xs font-medium hover:text-primary-500 underline"
        >
          View more
        </button>
      </div>
    );
  };

  return (
    <div id="reviews" className="">
      <div className="flex items-center mb-6">
        <Star size={20} fill="#262626" className="text-black" />
        <span className="ml-2 text-xl font-semibold">
          {data?.average_rating} {' - '}
        </span>

        <span className="ml-2 text-xl font-semibold">{data?.total_reviews} reviews</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[550px] overflow-y-auto px-3">
        {/* Review cards would go here */}
        {data?.reviews?.map((item: any) => (
          <div key={item.id} className="text-sm pb-6 border-b border-gray-100 last:border-b-0">
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
            <div className="mt-4">
              <TruncatedText
                text={item.content || ''}
                title="Review"
                maxLength={150}
                className="text-[#222222] text-sm"
              />
            </div>

            {/* Provider Reply */}
            {item.reply && (
              <div className="mt-4 border-gray-200 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle size={16} className="text-gray-600" />
                  <span className="text-xs font-medium text-black">Provider Reply</span>
                  <span className="text-xs text-gray-500">
                    {format(item.reply.created_at, 'dd MM yyyy')}
                  </span>
                </div>
                <TruncatedText
                  text={item.reply.content}
                  title="Provider Reply"
                  maxLength={100}
                  className="text-black text-sm leading-relaxed"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* <button className="mt-8 px-6 py-2 border border-gray-900 rounded-lg font-medium">
          Show all 73 reviews
        </button> */}

      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{viewContent.title}</DialogTitle>
          </DialogHeader>

          <DialogBody className="max-h-[60vh] overflow-y-auto">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <pre className="whitespace-pre-wrap text-gray-800 font-normal text-sm leading-relaxed">
                  {viewContent.content}
                </pre>
              </div>
            </div>
          </DialogBody>

          <DialogFooter className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsViewModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { Reviews };
