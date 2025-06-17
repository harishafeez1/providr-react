import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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
    <div className="flex-1">
      <ConnectProviderModal open={isModalOpen} onOpenChange={handleModalClose} />
      <WriteAReviewModal
        open={isReviewModalOpen}
        onOpenChange={handleReviewModalClose}
        data={DetailsData}
      />
      <div className="p-6 z-10">
        <div className="flex justify-center flex-col gap-4 mb-4">
          <Button
            variant={'outline'}
            onClick={handleReviewModalOpen}
            className="font-semibold text-xs"
          >
            Write A Review
          </Button>

          <div className="flex gap-6 justify-center items-center border card-rounded p-2">
            <Phone className="text-primary flex-shrink-0" size={18} />
            <span className="truncate overflow-hidden whitespace-nowrap">
              {(showPhoneNumber && (
                <a
                  href={`tel:${DetailsData?.company_phone}`}
                  className="text-primary"
                  title="Call this number"
                >
                  {DetailsData?.company_phone}
                </a>
              )) ||
                '************'}
            </span>
            {!showPhoneNumber && DetailsData?.company_phone && (
              <Eye
                size={18}
                onClick={() => setShowPhoneNumber(!showPhoneNumber)}
                className="flex-shrink-0 text-primary cursor-pointer"
              />
            )}
            {showPhoneNumber && (
              <EyeOff
                size={18}
                onClick={() => setShowPhoneNumber(!showPhoneNumber)}
                className="flex-shrink-0 text-primary cursor-pointer"
              />
            )}
          </div>
          <div className="flex gap-6 justify-center items-center border card-rounded p-2">
            <Mail className="text-primary flex-shrink-0" size={18} />
            <span className="truncate overflow-hidden whitespace-nowrap">
              {(showEmail && (
                <a
                  href={`mailto:${DetailsData?.company_email}?subject=Inquiry about ${DetailsData?.name} service&body=Hello, I am reaching out regarding your services.`}
                  className="text-primary"
                  title="Send email"
                >
                  {DetailsData?.company_email}
                </a>
              )) ||
                '************'}
            </span>
            {!showEmail && DetailsData?.company_email && (
              <Eye
                size={18}
                onClick={() => setShowEmail(!showEmail)}
                className="flex-shrink-0 text-primary cursor-pointer"
              />
            )}
            {showEmail && (
              <EyeOff
                size={18}
                onClick={() => setShowEmail(!showEmail)}
                className="flex-shrink-0 text-primary cursor-pointer"
              />
            )}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex gap-6 justify-center items-center border card-rounded p-2">
                  <Globe className="text-primary flex-shrink-0" size={18} />
                  <span className="truncate overflow-hidden whitespace-nowrap">
                    {DetailsData?.company_website ? (
                      <a href={DetailsData?.company_website} target="_blank">
                        {DetailsData?.company_website}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </span>
                </div>
              </TooltipTrigger>
              {DetailsData?.company_website && (
                <TooltipContent>
                  <p className="text-sm">{DetailsData?.company_website || 'N/A'}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          <div className="flex justify-around">
            {DetailsData?.facebook_url ? (
              <a
                href={DetailsData.facebook_url}
                className="cursor-pointer"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="text-primary" size={22} />
              </a>
            ) : (
              <Facebook className="text-primary" size={22} />
            )}

            {DetailsData?.instagram_url ? (
              <a
                href={DetailsData.instagram_url}
                className="cursor-pointer"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="text-primary" size={22} />
              </a>
            ) : (
              <Instagram className="text-primary" size={22} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectAndDetails;
