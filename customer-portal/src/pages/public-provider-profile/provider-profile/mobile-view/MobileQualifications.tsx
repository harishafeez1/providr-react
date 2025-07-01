import { Card, CardContent } from '@/components/ui/card';
import { useAppSelector } from '@/redux/hooks';
import { Eye, EyeOff, Facebook, Globe, Instagram, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import React, { useState } from 'react';
import { ConnectProviderModal, WriteAReviewModal } from '../blocks';
import { BottomSheetDialog } from '@/components';

const MobileQualifications = () => {
  const { providerProfile } = useAppSelector((state: any) => state.providerProfile);

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
    <>
      <h2 className="font-bold text-2xl mb-6 text-[#222222]">My qualifications</h2>

      <div className="">
        <ConnectProviderModal open={isModalOpen} onOpenChange={handleModalClose} />
        <BottomSheetDialog open={isReviewModalOpen} onOpenChange={handleReviewModalClose}>
          <div className="">Content goes here</div>
        </BottomSheetDialog>
        {/* <WriteAReviewModal
          open={isReviewModalOpen}
          onOpenChange={handleReviewModalClose}
          data={providerProfile}
        /> */}
        <div className="">
          <div className="flex justify-center flex-col gap-4 mb-4">
            <Button
              onClick={handleReviewModalOpen}
              className="font-semibold text-xs text-black bg-[#F2F2F2] hover:bg-[#F7F7F7] transition"
            >
              Write A Review
            </Button>

            <div className="flex gap-5">
              <div className="flex items-start">
                <Phone className="flex-shrink-0" strokeWidth={1.5} size={24} />
              </div>
              <div className="flex flex-1 flex-col space-y-2">
                <span className="text-sm font-semibold">Phone Number</span>

                <div className="flex items-center justify-between ">
                  <span className="truncate text-sm">
                    {showPhoneNumber ? (
                      <a
                        href={`tel:${providerProfile?.company_phone}`}
                        className="hover:underline text-primary"
                        title="Call this number"
                      >
                        {providerProfile?.company_phone}
                      </a>
                    ) : (
                      '************'
                    )}
                  </span>
                  <span className="pe-6">
                    {providerProfile?.company_phone && !showPhoneNumber && (
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
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="flex items-start">
                <Mail className=" flex-shrink-0" strokeWidth={1.5} size={24} />
              </div>
              <div className="flex-1 flex flex-col space-y-2">
                <span className="text-sm font-semibold">Email</span>

                <div className="flex items-center justify-between">
                  <span className="truncate text-sm">
                    {showEmail ? (
                      <ScrollArea className="w-[220px]">
                        <div className="pb-4">
                          <a
                            href={`mailto:${providerProfile?.company_email}?subject=Inquiry about ${providerProfile?.name} service&body=Hello, I am reaching out regarding your services.`}
                            className="text-primary text-sm block truncate"
                            title="Send email"
                          >
                            {providerProfile?.company_email}
                          </a>
                        </div>
                        <ScrollBar orientation="horizontal" className="mt-1" />
                      </ScrollArea>
                    ) : (
                      <span className="text-sm">************</span>
                    )}
                  </span>
                  <div className="pb-4 pe-6">
                    {!showEmail && providerProfile?.company_email && (
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
            </div>
            <div className="flex gap-5">
              <div className=" flex items-start">
                <Globe className=" flex-shrink-0" strokeWidth={1.5} size={24} />
              </div>
              <div className="flex-1  flex flex-col space-y-2">
                <span className="text-sm font-semibold">Website</span>

                <div className="flex items-center justify-between">
                  <span className="truncate text-sm">
                    {providerProfile?.company_website ? (
                      <ScrollArea className="w-[300px]">
                        <div className="pb-4">
                          <a href={providerProfile?.company_website} target="_blank">
                            {providerProfile?.company_website}
                          </a>
                        </div>
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

      <Card className="h-[230px] shadow-lg rounded-3xl p-4">
        <CardContent className="flex flex-col gap-2 items-center justify-center">
          {providerProfile?.business_logo && (
            <div className="w-[104px] h-[104px]">
              <img
                src={
                  providerProfile?.business_logo
                    ? `${import.meta.env.VITE_APP_AWS_URL}/${providerProfile?.business_logo}`
                    : ''
                }
                alt=""
                className="h-full w-full object-cover rounded-full ring-white ring-2"
              />
            </div>
          )}
          <div className="font-bold text-black text-center line-clamp-2">
            {providerProfile?.name || ''}
          </div>
          <div className="text-[#6a6a6a] text-xs">Provider</div>
        </CardContent>
      </Card>
    </>
  );
};

export { MobileQualifications };
