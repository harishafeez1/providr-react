import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { useAppSelector } from '@/redux/hooks';
import { MapPin } from 'lucide-react';
import CarSvg from '/media/app/building-car.svg';
import { CountriesFlags } from '../blocks';

const MobileServicesSection = () => {
  const { providerProfile } = useAppSelector((state: any) => state.providerProfile);

  return (
    <>
      {providerProfile?.service_offerings?.map((item: any) => (
        <div key={item.id} className="mb-5 text-black">
          <div className="flex gap-5 items-center truncate me-6">
            <div className="space-y-2">
              {item.service.service_icon ? (
                <div className="h-[104px] w-[104px] rounded-2xl overflow-hidden">
                  <Dialog>
                    <DialogTrigger asChild>
                      <img
                        src={`${import.meta.env.VITE_APP_AWS_URL}/service-images/${item.service.service_icon}`}
                        alt="service icon"
                        className="w-full h-full object-cover rounded-2xl cursor-pointer"
                      />
                    </DialogTrigger>
                    <DialogContent className="max-w-7xl font-montserrat text-black">
                      <div className="grid grid-cols-2 p-4 items-center gap-8">
                        <img
                          src={`${import.meta.env.VITE_APP_AWS_URL}/service-images/${item.service.service_icon}`}
                          alt="service icon"
                          className="w-full h-full object-cover rounded-2xl"
                        />
                        <div className="col-span-1 text-center">
                          <h3 className="font-semibold text-2xl mb-3">
                            {item?.service?.name || ''}
                          </h3>
                          <div className="text-[#7B7171] break-all">{item.description || ''}</div>
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
              <p className="text-sm break-all overflow-hidden text-ellipsis whitespace-normal line-clamp-2 text-[#6A6A6A]">
                {item?.description || ''}
              </p>
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
                      {providerProfile?.access_method_collection?.map(
                        (option: any, index: number) => (
                          <div key={index} className="badge badge-gray-100 text-center">
                            <div className="flex-1 text-black font-semibold">{option}</div>
                          </div>
                        )
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="link" size={'sm'} className="text-zinc-800">
                      View Services Areas
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl  font-montserrat text-black">
                    <DialogHeader className="text-lg font-bold">Service Areas</DialogHeader>
                    <div className="grid grid-cols-2 p-4 items-center gap-4">
                      {item?.service_available_options?.map((option: any, index: number) => (
                        <div key={index} className="badge badge-gray-100 text-center">
                          <span className="text-black font-semibold">{option}</span>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
                {/* <div className="">
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="cursor-pointer">
                        <CountriesFlags languages={providerProfile?.language_collection || []} />
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl font-montserrat text-black">
                      <DialogHeader className="text-lg font-bold">Languages</DialogHeader>
                      <div className="grid grid-cols-2 p-4 items-center gap-4">
                        {providerProfile?.language_collection?.map((option: any, index: number) => (
                          <div key={index} className="badge badge-gray-100 text-center">
                            <span className="text-black font-semibold">{option}</span>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export { MobileServicesSection };
