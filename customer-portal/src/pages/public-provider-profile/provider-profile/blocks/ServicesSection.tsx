import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog';

import CarSvg from '/media/app/building-car.svg';
import { MapPin } from 'lucide-react';
import { CountriesFlags } from './CountriesFlags';

const ServicesSection = ({ Services }: any) => {
  return (
    <>
      {Services?.service_offerings?.slice(0, 4)?.map((item: any) => (
        <div key={item.id} className="mb-4">
          <div className="flex gap-6 items-center truncate me-6">
            <div className="space-y-2">
              {item.service.service_icon ? (
                <div className="h-[133px] w-[136px] rounded-3xl overflow-hidden">
                  <img
                    src={`${import.meta.env.VITE_APP_AWS_URL}/service-images/${item.service.service_icon}`}
                    alt="service icon"
                    className="w-full h-full object-cover rounded-3xl"
                  />
                </div>
              ) : (
                ''
              )}
            </div>
            <div className="">
              <h3 className="font-semibold">{item?.service?.name || ''}</h3>
              <p className="text-sm break-words">{item?.description || ''}</p>
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
                  <DialogContent className="max-w-xl">
                    <DialogHeader className="text-lg font-bold">Access Methods</DialogHeader>
                    <div className="grid grid-cols-2 p-4 items-start gap-4">
                      {Services?.access_method_collection?.map((option: any, index: number) => (
                        <div key={index} className="badge badge-sm badge-gray-100 text-center">
                          <div className="flex-1">{option}</div>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="link" size={'sm'} className="text-zinc-800">
                      View Services Areas
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl">
                    <DialogHeader className="text-lg font-bold">Service Areas</DialogHeader>
                    <div className="grid grid-cols-2 p-4 items-center gap-4">
                      {item?.service_available_options?.map((option: any, index: number) => (
                        <div key={index} className="badge badge-sm badge-gray-100 text-center">
                          <span>{option}</span>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
                <div className="">
                  <CountriesFlags languages={Services?.language_collection || []} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export { ServicesSection };
