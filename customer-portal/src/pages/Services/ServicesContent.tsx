import { useAppSelector } from '@/redux/hooks';
import AirbnbWizard from './blocks/WizardStep';

export default function ServicesContent() {
  const { selectedServiceId, serviceLocation, participantData, wizardData } = useAppSelector(
    (state: any) => state.services
  );
  return (
    <main className=" bg-gray-50 py-8">
      {/* <div className="h-12 flex flex-row justify-center items-center text-black gap-4 max-w-screen-lg m-auto">
        <div className="border-primary border-2 w-52 p-3 text-center rounded-xl flex flex-col">
          <span className="font-semibold">Available Providers</span>
          <span className="font-semibold text-primary">1000</span>
        </div>
      </div> */}
      {/* <div className="h-12 flex flex-row justify-center items-center text-white gap-4 max-w-screen-lg m-auto">
        <div className="bg-primary w-52 p-3 text-center rounded-xl">asdas</div>
        <div className="bg-primary w-52 p-3 text-center rounded-xl">asdas</div>
        <div className="bg-primary w-52 p-3 text-center rounded-xl">asdas</div>
        <div className="bg-primary w-52 p-3 text-center rounded-xl">asdasd</div>
      </div> */}
      <AirbnbWizard />
    </main>
  );
}
