import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { useAppSelector } from '@/redux/hooks';
import { MapPin } from 'lucide-react';
import CarSvg from '/media/app/building-car.svg';
import { CountriesFlags } from '../blocks';
import { BottomSheetDialog } from '@/components';
import React, { useEffect, useState } from 'react';
import ServiceLocationMap from '../blocks/ServiceLocationMap';

const MobileServicesSection = () => {
  const { providerProfile } = useAppSelector((state: any) => state.providerProfile);
  const [activeService, setActiveService] = useState<any | null>(null);
  const [showAccessMethods, setShowAccessMethods] = useState<any | null>(null);
  const [showServiceAreas, setShowServiceAreas] = useState<any | null>(null);
  const [showLanguages, setShowLanguages] = useState(false);

  // Missing variables from desktop version now available
  const languageCollection = providerProfile?.language_collection;

  // Convert service_available_options to map format for selected service
  const serviceLocations = React.useMemo(() => {
    if (!showServiceAreas?.service_available_options || !Array.isArray(showServiceAreas.service_available_options)) {
      return [];
    }
    
    return showServiceAreas.service_available_options
      .filter((option: any) => 
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
  }, [showServiceAreas?.service_available_options]);

  return (
    <>
      {activeService && (
        <BottomSheetDialog
          open={!!activeService}
          onOpenChange={(open) => {
            if (!open) setActiveService(null);
          }}
        >
          <div className="grid grid-cols-1 items-center gap-8">
            <img
              src={`${import.meta.env.VITE_APP_AWS_URL}/service-images/${activeService.service?.service_icon}`}
              alt="service icon"
              className="w-full h-[40vh] object-contain rounded-3xl"
            />
            <div className="col-span-1 text-center">
              <h3 className="font-semibold text-2xl mb-3">{activeService?.service?.name || ''}</h3>
              <div className="text-[#7B7171] break-all">{activeService?.description || ''}</div>
            </div>
          </div>
        </BottomSheetDialog>
      )}

      {/* Access Methods Modal */}
      {showAccessMethods && (
        <BottomSheetDialog
          open={!!showAccessMethods}
          onOpenChange={(open) => !open && setShowAccessMethods(null)}
          title="Access Methods"
        >
          <div className="grid grid-cols-1 p-4 items-start gap-4 max-h-[80vh] overflow-y-auto">
            {showAccessMethods?.service_delivered_options?.map((option: any, index: number) => (
              <div key={index} className="badge badge-gray-100 text-center">
                <div className="flex-1 text-black font-semibold">{option}</div>
              </div>
            ))}
          </div>
        </BottomSheetDialog>
      )}

      {/* Service Areas Modal */}
      {showServiceAreas && (
        <BottomSheetDialog
          open={!!showServiceAreas}
          onOpenChange={(open) => !open && setShowServiceAreas(null)}
          title={`${showServiceAreas?.service?.name || 'Service'} Areas`}
        >
          <div className="p-4 max-h-[80vh] overflow-y-auto">
            <ServiceLocationMap
              addresses_collection={serviceLocations.map(location => ({
                lat: location.lat,
                lng: location.lng,
                radius: location.radius_km
              }))}
              accessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ''}
            />
          </div>
        </BottomSheetDialog>
      )}

      {providerProfile?.service_offerings?.map((item: any) => (
        <div key={item.id} className="mb-5 text-black">
          <div className="flex gap-5 items-center truncate me-6">
            <div className="space-y-2">
              {item.service.service_icon && (
                <>
                  {/* Trigger area */}
                  <div
                    className="h-[104px] w-[104px] rounded-2xl overflow-hidden cursor-pointer"
                    onClick={() => setActiveService(item)}
                  >
                    <img
                      src={`${import.meta.env.VITE_APP_AWS_URL}/service-images/${item.service.service_icon}`}
                      alt="service icon"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold ">{item?.service?.name || ''}</h3>
              <p className="text-sm break-all overflow-hidden text-ellipsis whitespace-normal line-clamp-2 text-[#6A6A6A]">
                {item?.description || ''}
              </p>
              <div className="flex items-center">
                <Button
                  variant="link"
                  size={'sm'}
                  className="text-zinc-800 flex items-center justify-start p-0"
                  onClick={() => setShowAccessMethods(item)}
                >
                  <MapPin strokeWidth={3} className="text-black" />
                  <img src={CarSvg} alt="Car" className="h-6" />
                </Button>

                <Button
                  variant="link"
                  size={'sm'}
                  className="text-zinc-800"
                  onClick={() => setShowServiceAreas(item)}
                >
                  View Services Areas
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export { MobileServicesSection };
