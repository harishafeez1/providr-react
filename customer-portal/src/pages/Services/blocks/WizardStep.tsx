import { useEffect, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useAppSelector } from '@/redux/hooks';
import ReactSelect from 'react-select';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import { geocodeByAddress, getLatLng, geocodeByPlaceId } from 'react-google-places-autocomplete';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { store } from '@/redux/store';
import {
  setResetServiceState,
  setSelectedServiceId,
  setServiceDetails,
  setServiceLocation,
  setServiceParticipantData,
  setUpdateWizardData
} from '@/redux/slices/services-slice';
import { getAuth, useAuthContext } from '@/auth';
import { getStoreRequest } from '@/services/api/service-requests';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function AirbnbWizard() {
  const { selectedServiceId, serviceLocation, participantData, wizardData } = useAppSelector(
    (state) => state.services
  );
  const { auth, currentUser, setCurrentUser, getUser, saveAuth } = useAuthContext();
  const [finishLoading, setFinishLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Service',
      description: 'What service do you need?',
      component: <BasicInfoStep />
    },
    {
      title: 'Location',
      description: 'Where do you need the service?',
      component: <LocationStep />
    },
    {
      title: 'Participant',
      description: 'Who needs this service?',
      component: <PhotosStep />
    },
    {
      title: 'Details',
      description: 'A few more final details',
      component: <PricingStep />
    }
  ];

  const handleStroeRequest = async () => {
    if (getAuth()?.token) {
      const wizardWithCustomerId = { ...wizardData, customer_id: currentUser?.id };
      setFinishLoading(true);
      const res = await getStoreRequest(wizardWithCustomerId);
      if (res) {
        setFinishLoading(false);
        store.dispatch(setResetServiceState());
        setCurrentStep(0);
      }
    }
  };

  const isNextDisabled = () => {
    switch (currentStep) {
      case 0:
        return !selectedServiceId; // Disable if no service is selected
      case 1:
        return !serviceLocation?.address; // Disable if location is not selected
      case 2:
        return !participantData.first_name || !participantData.email || !participantData.phone; // Disable if participant info is incomplete
      case 3:
        return wizardData?.length <= 0;
      case 4:
        return finishLoading;
      default:
        return false;
    }
  };

  useEffect(() => {
    if (getAuth()?.token) {
      getUser().then(() => {
        const auth = getAuth();
        saveAuth(auth);
        setCurrentUser(auth?.customer);
      });
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === import.meta.env.VITE_APP_NAME) {
        console.log('🔹 Detected login from another tab!');
        setIsLoggedIn(true);
      }
    };

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const nextStep = () => {
    if (currentStep === steps.length - 1) {
      const token = auth?.token;
      if (!token) {
        // Open login page & give it time to load
        const loginTab = window.open('/login', '_blank');

        if (!loginTab) {
          console.error('❌ Failed to open login tab. Make sure pop-ups are not blocked.');
          return;
        }

        console.log('✅ Login tab opened. Waiting for authentication...');

        return;
      }
      if (token) {
        handleStroeRequest();
      }
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <Card className="border-none shadow-lg">
        <CardHeader className="pb-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold text-gray-900">Find Services</h1>
          </div>
          <div className="flex justify-between mb-8">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-2
                    ${
                      index < currentStep
                        ? 'bg-primary text-white'
                        : index === currentStep
                          ? 'border-2 border-primary text-primary'
                          : 'border-2 border-gray-300 text-gray-300'
                    }`}
                >
                  {index < currentStep ? <Check className="w-4 h-4" /> : <span>{index + 1}</span>}
                </div>
                <span
                  className={`text-xs hidden md:block
                    ${index <= currentStep ? 'text-gray-900' : 'text-gray-400'}`}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="py-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{steps[currentStep].title}</h2>
            <p className="text-gray-500 mb-6">{steps[currentStep].description}</p>
            {steps[currentStep].component}
          </div>
        </CardContent>
        <CardFooter className=" py-6 flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="btn btn-secondary"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="relative">
            <Button
              onClick={nextStep}
              disabled={currentStep === steps.length || isNextDisabled()}
              className="btn btn-primary "
            >
              {currentStep === steps.length - 1
                ? getAuth()?.token
                  ? 'Complete'
                  : 'Login'
                : 'Next'}
              {/* <ChevronRight className="w-4 h-4 ml-2" /> */}
            </Button>

            {currentStep === steps.length - 1 && !getAuth()?.token && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="">
                    <div className="absolute -top-[30px] right-[-10px] flex items-center w-max space-x-1">
                      <Info className="text-danger" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-48 text-danger">
                      * You must be logged in to complete this request.
                      <br />
                      Please log in and return once you have successfully signed in.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
function BasicInfoStep() {
  const { services } = useAppSelector((state) => state.services);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold pb-2">Service Information</h3>
        <div className="flex items-baseline flex-wrap gap-2.5 mb-4">
          <ReactSelect
            options={services}
            onChange={(item: any) => store.dispatch(setSelectedServiceId(item.value))}
            className="w-full text-sm"
          />
        </div>
      </div>
      {/* <div>
        <h4 className="text-sm font-medium mb-2">Suggestions</h4>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              className="btn btn-primary"
              onClick={() => setService(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div> */}
    </div>
  );
}

function LocationStep() {
  const handleLocationChange = async (address: any) => {
    let location: {
      latitude?: string;
      longitude?: string;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      zip_code?: string;
    } = {};
    await geocodeByAddress(address.label)
      .then((results) => getLatLng(results[0]))
      .then(
        ({ lat, lng }) => (
          (location.address = address.label),
          (location.state = address.value.structured_formatting.secondary_text),
          (location.state = address.value.structured_formatting.secondary_text),
          (location.latitude = String(lat)),
          (location.longitude = String(lng))
        )
      )
      .then(() => store.dispatch(setServiceLocation(location)));
    const results = await geocodeByPlaceId(address.value.place_id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-baseline flex-wrap gap-2.5 mb-4">
        <label className="form-label flex items-center gap-1 max-w-56">
          Enter the service location
        </label>
        <div className="w-full">
          <GooglePlacesAutocomplete
            apiKey={import.meta.env.VITE_APP_GOOGLE_API_KEY}
            onLoadFailed={(err) => {
              console.error('Could not load google places autocomplete', err);
            }}
            autocompletionRequest={{
              componentRestrictions: {
                country: 'aus'
              }
            }}
            selectProps={{
              isClearable: true,
              placeholder: 'Search for a place',
              onChange: handleLocationChange
            }}
          />
        </div>
      </div>
    </div>
  );
}

function PhotosStep() {
  return (
    <div className="space-y-6">
      <div className="flex items-baseline flex-wrap gap-2.5 mb-4">
        <label className="form-label flex items-center gap-1 max-w-56">First name</label>
        <input
          className="input w-full"
          placeholder="First name"
          type="text"
          required
          onChange={(e) =>
            store.dispatch(
              setServiceParticipantData({
                ...store.getState().services.participantData,
                first_name: e.target.value
              })
            )
          }
        />
      </div>
      <div className="flex items-baseline flex-wrap gap-2.5 mb-4">
        <label className="form-label flex items-center gap-1 max-w-56">Last name</label>
        <input
          className="input w-full"
          placeholder="Last name"
          type="text"
          onChange={(e) =>
            store.dispatch(
              setServiceParticipantData({
                ...store.getState().services.participantData,
                last_name: e.target.value
              })
            )
          }
        />
      </div>
      <div className="flex items-baseline flex-wrap gap-2.5 mb-4">
        <label className="form-label flex items-center gap-1 max-w-56">Gender</label>
        <Select
          onValueChange={(item) =>
            store.dispatch(
              setServiceParticipantData({
                ...store.getState().services.participantData,
                gender: item
              })
            )
          }
        >
          <SelectTrigger className="">
            <SelectValue placeholder="Select a Gender" />
          </SelectTrigger>
          <SelectContent className="">
            <SelectGroup>
              <SelectItem value="male">MALE</SelectItem>
              <SelectItem value="female">FEMALE</SelectItem>
              <SelectItem value="others">OTHERS</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-baseline flex-wrap gap-2.5 mb-4">
        <label className="form-label flex items-center gap-1 max-w-56">Email</label>
        <input
          className="input w-full"
          placeholder="abc@gmail.com"
          type="email"
          required
          onChange={(e) =>
            store.dispatch(
              setServiceParticipantData({
                ...store.getState().services.participantData,
                email: e.target.value
              })
            )
          }
        />
      </div>

      <div className="flex items-baseline flex-wrap gap-2.5 mb-4">
        <label className="form-label flex items-center gap-1 max-w-56">Phone</label>
        <input
          className="input w-full"
          placeholder=""
          type="text"
          required
          onChange={(e) =>
            store.dispatch(
              setServiceParticipantData({
                ...store.getState().services.participantData,
                phone: e.target.value
              })
            )
          }
        />
      </div>

      {/* <div className="flex items-baseline flex-wrap gap-2.5 mb-4">
        <label className="form-label flex items-center gap-1 max-w-56">
          Where should we send the results?
        </label>
        <input className="input w-full" placeholder="Enter Your Email Address" type="text" />
      </div>
      <label className="form-label flex items-center gap-1 max-w-56">Select who this is for</label>
      <div className="grid grid-cols-3 gap-4">
        <label className="flex items-center justify-center border text-center bg-no-repeat bg-cover border-gray-300 rounded-xl has-[:checked]:border-primary has-[:checked]:bg-[#8a4099] has-[:checked]:text-white has-[:checked]:border-2 [&_.checked]:has-[:checked]:flex h-[70px] mb-0.5">
          <input
            className="appearance-none"
            type="radio"
            name="appearance_option"
            defaultChecked={true}
            value="2"
          />
          <span className="text-center text-md">Myself</span>
        </label>

        <label className="flex items-center justify-center border text-center bg-no-repeat bg-cover border-gray-300 rounded-xl has-[:checked]:border-primary has-[:checked]:bg-[#8a4099] has-[:checked]:text-white has-[:checked]:border-2 [&_.checked]:has-[:checked]:flex h-[70px] mb-0.5">
          <input
            className="appearance-none"
            type="radio"
            name="appearance_option"
            defaultChecked={true}
            value="2"
          />
          <span className="text-center text-md">Someone I care for</span>
        </label>
        <label className="flex items-center justify-center border text-center bg-no-repeat bg-cover border-gray-300 rounded-xl has-[:checked]:border-primary has-[:checked]:bg-[#8a4099] has-[:checked]:text-white has-[:checked]:border-2 [&_.checked]:has-[:checked]:flex h-[70px] mb-0.5">
          <input
            className="appearance-none"
            type="radio"
            name="appearance_option"
            defaultChecked={true}
            value="2"
          />
          <span className="text-center text-md">Enter Your Email Address</span>
        </label>
      </div> */}
    </div>
  );
}

function PricingStep() {
  const [selectedAge, setSelectedAge] = useState<string>('Mature Age (60+ years)');

  useEffect(() => {
    store.dispatch(setServiceDetails([selectedAge]));
    store.dispatch(setUpdateWizardData());
  }, [selectedAge]);

  const handleSelection = (age: string) => {
    setSelectedAge(age);
  };

  const ageOptions = [
    'Mature Age (60+ years)',
    'Adults (22-59 years)',
    'Young people (17-21 years)',
    'Children (8-16 years)',
    'Early Childhood (0-7 years)'
  ];

  return (
    <div className="space-y-6">
      <label className="form-label flex items-center gap-1 max-w-56">Participants age range</label>
      <div className="grid grid-cols-3 gap-4">
        {ageOptions.map((age) => (
          <label
            key={age}
            className={`flex items-center justify-center border text-center bg-no-repeat bg-cover border-gray-300 rounded-xl h-[70px] mb-0.5 cursor-pointer 
            ${selectedAge === age ? 'border-primary bg-[#8a4099] text-white border-2' : ''}`}
          >
            <input
              className="appearance-none"
              type="radio"
              name="age_option"
              value={age}
              checked={selectedAge === age}
              onChange={() => handleSelection(age)}
            />
            <span className="text-center text-md">{age}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
