import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import React, { useState, useRef, useEffect } from 'react';

import { MapPin } from 'lucide-react';
import CarSvg from '/media/app/building-car.svg';
import ServiceLocationModal from './ServiceLocationModal';

const ServicesSection = ({ Services }: any) => {
  const ServiceItem = ({ item }: { item: any }) => {
    const [showViewMore, setShowViewMore] = useState(false);
    const [isServiceMapModalOpen, setIsServiceMapModalOpen] = useState(false);
    const textRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
      const checkTextOverflow = () => {
        if (textRef.current) {
          const element = textRef.current;
          const lineHeight = parseInt(getComputedStyle(element).lineHeight);
          const maxHeight = lineHeight;
          setShowViewMore(element.scrollHeight > maxHeight);
        }
      };

      checkTextOverflow();
      window.addEventListener('resize', checkTextOverflow);
      return () => window.removeEventListener('resize', checkTextOverflow);
    }, [item?.description]);

    // Convert service_available_options to map format
    const serviceLocations = React.useMemo(() => {
      if (!item?.service_available_options || !Array.isArray(item.service_available_options)) {
        return [];
      }

      return item.service_available_options
        .filter(
          (option: any) =>
            option &&
            typeof option === 'object' &&
            !isNaN(Number(option.lat)) &&
            !isNaN(Number(option.lng)) &&
            !isNaN(Number(option.radius_km))
        )
        .map((option: any) => ({
          lat: Number(option.lat),
          lng: Number(option.lng),
          radius_km: Number(option.radius_km)
        }));
    }, [item?.service_available_options]);

    return (
      <>
        <div className="mb-7">
          <div className="flex gap-6 items-center">
            <div className="space-y-2">
              {item.service.service_icon ? (
                <div className="h-[133px] w-[136px] rounded-3xl overflow-hidden">
                  <Dialog>
                    <DialogTrigger asChild>
                      <img
                        src={`${import.meta.env.VITE_APP_AWS_URL}/service-images/${item.service.service_icon}`}
                        alt="service icon"
                        className="w-full h-full object-cover rounded-3xl cursor-pointer"
                      />
                    </DialogTrigger>
                    <DialogContent className="max-w-7xl font-montserrat text-black">
                      <div className="grid grid-cols-2 p-4 items-center gap-8">
                        <img
                          src={`${import.meta.env.VITE_APP_AWS_URL}/service-images/${item.service.service_icon}`}
                          alt="service icon"
                          className="w-full h-full object-cover rounded-3xl"
                        />
                        <div className="col-span-1 text-center">
                          <h3 className="font-semibold text-2xl mb-3">
                            {item?.service?.name || ''}
                          </h3>
                          <div className="text-[#7B7171]">{item.description || ''}</div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                ''
              )}
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold ">{item?.service?.name || ''}</h3>
              <div>
                <p ref={textRef} className="text-sm text-[#6A6A6A] line-clamp-1">
                  {item?.description || ''}
                </p>
                {showViewMore && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-xs text-primary hover:text-primary-800 mt-1">
                        View more
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl font-montserrat text-black">
                      <DialogHeader className="text-lg font-bold">
                        {item?.service?.name || 'Service Description'}
                      </DialogHeader>
                      <div className="p-4">
                        <p className="text-[#6A6A6A] leading-relaxed">{item?.description || ''}</p>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <div className="flex items-center">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="link"
                      size={'sm'}
                      className="text-zinc-800 flex items-center justify-start p-0"
                    >
                      <MapPin strokeWidth={3} className="text-black" />
                      <img src={CarSvg} alt="Car" className="h-6" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl  font-montserrat text-black">
                    <DialogHeader className="text-lg font-bold">Access Methods</DialogHeader>
                    <div className="grid grid-cols-2 p-4 items-start gap-4">
                      {item?.service_delivered_options?.map((option: any, index: number) => (
                        <div key={index} className="badge badge-gray-100 text-center">
                          <div className="flex-1 text-black font-semibold">{option}</div>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="link"
                  size={'sm'}
                  className="text-zinc-800"
                  onClick={() => {
                    setIsServiceMapModalOpen(true);
                  }}
                >
                  View Service Areas
                </Button>
                <div className="">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="link" size={'sm'} className="text-zinc-800">
                        View Languages
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl font-montserrat text-black">
                      <DialogHeader className="text-lg font-bold">Languages</DialogHeader>
                      <div className="grid grid-cols-2 p-4 items-center gap-4">
                        {Services?.language_collection?.map((option: any, index: number) => (
                          <div key={index} className="badge badge-gray-100 text-center">
                            <span className="text-black font-semibold">{option}</span>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Location Map Modal */}
        <ServiceLocationModal
          isOpen={isServiceMapModalOpen}
          onClose={() => setIsServiceMapModalOpen(false)}
          addresses_collection={serviceLocations}
          providerName={`${item?.service?.name || 'Service'} Areas`}
        />
      </>
    );
  };

  return (
    <>
      {Services?.service_offerings?.map((item: any) => <ServiceItem key={item.id} item={item} />)}
    </>
  );
};

export { ServicesSection };
