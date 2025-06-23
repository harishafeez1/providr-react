import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, EyeOff, Facebook, Globe, Instagram, Mail, Phone } from 'lucide-react';
import { useState } from 'react';
import { ConnectProviderModal } from './ConnectProviderModal';
import { WriteAReviewModal } from './WriteAReviewModal';

const ConnectAndDetails = ({ DetailsData }: any) => {
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  const handleReviewModalOpen = () => {
    setIsReviewModalOpen(true);
  };

  const handleReviewModalClose = () => {
    setIsReviewModalOpen(false);
  };
  return (
    <div className="flex-1 mt-16">
      <ConnectProviderModal open={isModalOpen} onOpenChange={handleModalClose} />
      <WriteAReviewModal
        open={isReviewModalOpen}
        onOpenChange={handleReviewModalClose}
        data={DetailsData}
      />
      <div className="p-6 z-10">
        <div className="flex justify-center flex-col gap-4 mb-4">
          <Button
            onClick={handleReviewModalOpen}
            className="font-semibold text-xs text-black bg-[#F2F2F2] hover:bg-[#F7F7F7] transition"
          >
            Write A Review
          </Button>

          <div className="grid grid-cols-12 gap-2 items-start">
            <div className="col-span-2 flex items-start pt-1">
              <Phone className="flex-shrink-0" strokeWidth={1.5} size={24} />
            </div>
            <div className="col-span-10 flex flex-col space-y-2">
              <span className="text-sm font-semibold">Phone Number</span>

              <div className="flex items-center justify-between pe-6 space-x-2">
                <span className="truncate text-sm">
                  {showPhoneNumber ? (
                    <a
                      href={`tel:${DetailsData?.company_phone}`}
                      className="hover:underline text-primary"
                      title="Call this number"
                    >
                      {DetailsData?.company_phone}
                    </a>
                  ) : (
                    '************'
                  )}
                </span>

                {DetailsData?.company_phone && !showPhoneNumber && (
                  <Eye
                    size={18}
                    onClick={() => setShowPhoneNumber(true)}
                    className="cursor-pointer hover:text-gray-600"
                  />
                )}
                {showPhoneNumber && (
                  <EyeOff
                    size={18}
                    onClick={() => setShowPhoneNumber(false)}
                    className="cursor-pointer hover:text-gray-600"
                  />
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-2 items-start">
            <div className="col-span-2 flex items-start pt-1">
              <Mail className=" flex-shrink-0" strokeWidth={1.5} size={24} />
            </div>
            <div className="col-span-10 flex flex-col space-y-2">
              <span className="text-sm font-semibold">Email</span>

              <div className="flex items-center justify-between pe-6 space-x-2">
                <span className="truncate text-sm">
                  {(showEmail && (
                    <ScrollArea className="w-[300px]">
                      <a
                        href={`mailto:${DetailsData?.company_email}?subject=Inquiry about ${DetailsData?.name} service&body=Hello, I am reaching out regarding your services.`}
                        className="text-primary"
                        title="Send email"
                      >
                        {DetailsData?.company_email}
                      </a>
                      <ScrollBar orientation="horizontal" className="mt-2" />
                    </ScrollArea>
                  )) ||
                    '************'}
                </span>

                {!showEmail && DetailsData?.company_email && (
                  <Eye
                    size={18}
                    onClick={() => setShowEmail(!showEmail)}
                    className="cursor-pointer hover:text-gray-600"
                  />
                )}
                {showEmail && (
                  <EyeOff
                    size={18}
                    onClick={() => setShowEmail(!showEmail)}
                    className="cursor-pointer hover:text-gray-600 shrink-0"
                  />
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-2 items-start">
            <div className="col-span-2 flex items-start pt-1">
              <Globe className=" flex-shrink-0" strokeWidth={1.5} size={24} />
            </div>
            <div className="col-span-10 flex flex-col space-y-2">
              <span className="text-sm font-semibold">Website</span>

              <div className="flex items-center justify-between pe-6 space-x-2">
                <span className="truncate text-sm">
                  {DetailsData?.company_website ? (
                    <ScrollArea className="w-[300px]">
                      <a href={DetailsData?.company_website} target="_blank">
                        {DetailsData?.company_website}
                      </a>
                      <ScrollBar orientation="horizontal" className="mt-2" />
                    </ScrollArea>
                  ) : (
                    'N/A'
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectAndDetails;
