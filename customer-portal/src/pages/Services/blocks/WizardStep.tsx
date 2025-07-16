import { useEffect, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useAppSelector } from '@/redux/hooks';
import ReactSelect from 'react-select';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import { geocodeByAddress, getLatLng, geocodeByPlaceId } from 'react-google-places-autocomplete';
import * as Yup from 'yup';
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
import ProgressBar from './ProgressBar';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@/components';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';

export default function AirbnbWizard() {
  const { selectedServiceId, serviceLocation, participantData, wizardData } = useAppSelector(
    (state) => state.services
  );
  const { auth, currentUser, setCurrentUser, getUser, saveAuth } = useAuthContext();
  const [finishLoading, setFinishLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);
  const [availableProvidersCount, setAvailableProvidersCount] = useState(0);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

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
    const hasToken = getAuth()?.token;
    const payload = hasToken ? { ...wizardData, customer_id: currentUser?.id } : wizardData;
    if (availableProvidersCount === 0) {
      toggleModal();
    } else {
      setFinishLoading(true);
      const res = await getStoreRequest(payload);

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
        return !participantData.first_name || !participantData.email || !participantData.phone;
      case 3:
        return wizardData?.length <= 0;
      default:
        return false;
    }
  };

  const nextStep = async () => {
    if (currentStep === steps.length - 1) {
      await handleStroeRequest();
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

  useEffect(() => {
    //apicall
    if (currentStep !== 0) {
      // setAvailableProvidersCount((prev) => prev + 1);
    }
  }, [currentStep]);

  return (
    <>
      <Dialog open={showModal} onOpenChange={toggleModal}>
        <DialogContent className="p-8">
          <div className="flex flex-col gap-4 justify-center items-center">
            <img
              src={`${import.meta.env.VITE_APP_AWS_URL}/man-helping-woman-for-carrier.png`}
              className="object-cover h-60"
            />
            <div className="text-center text-lg font-semibold text-black">
              Unfortunately, we are unable to locate any providers who can meet your current
              requirements.
            </div>
            <div className="text-pretty text-sm text-gray-700">
              Please consider modifying your requirements or browse our directory of providers to
              find a suitable match.
            </div>
            <div className="flex justify-center gap-6">
              {/* <Link className="btn btn-primary" to={'/directory'}>
                Browse Directory
              </Link> */}
              <Link className="btn btn-primary" to={'/directory'}>
                Browse Directory
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="max-w-3xl mx-auto p-4 md:p-6">
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-0">
            {/* <ProgressBar currentStep={currentStep} steps={4} /> */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-semibold text-gray-900">Find Services</h1>

              <div className="flex items-center gap-6 ">
                <div className="font-semibold">Available Providers</div>
                <div className="border-primary rounded-full border-2 font-semibold px-2">
                  {availableProvidersCount}
                </div>
              </div>
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
                disabled={currentStep === steps.length || isNextDisabled() || finishLoading}
                className="btn btn-primary "
              >
                {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                {/* <ChevronRight className="w-4 h-4 ml-2" /> */}
              </Button>

              {/* {currentStep === steps.length - 1 && !getAuth()?.token && (
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
            )} */}
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
function BasicInfoStep() {
  const { transformedServicesList, selectedServiceId } = useAppSelector((state) => state.services);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold pb-2">Service Information</h3>
        <div className="flex items-baseline flex-wrap gap-2.5 mb-4">
          <ReactSelect
            defaultValue={transformedServicesList.find(
              (item: any) => item.value === selectedServiceId
            )}
            options={transformedServicesList}
            onChange={(item: any) => store.dispatch(setSelectedServiceId(item.value))}
            className="w-full text-sm"
          />
        </div>
      </div>
    </div>
  );
}

function LocationStep() {
  const { serviceLocation } = useAppSelector((state) => state.services);

  const defaultValue = serviceLocation?.address
    ? {
        label: serviceLocation.address,
        value: {
          place_id: '',
          description: serviceLocation?.address,
          structured_formatting: {
            main_text: serviceLocation?.city || '',
            secondary_text: serviceLocation?.state || ''
          }
        }
      }
    : null;

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
              // location: userLocation ?? undefined,
              // radius: 20000,
              componentRestrictions: {
                country: 'au'
              },
              types: ['(regions)']
            }}
            apiOptions={{
              region: 'AU'
            }}
            selectProps={{
              isClearable: true,
              placeholder: 'Search for a place',
              onChange: handleLocationChange,
              defaultValue: defaultValue
            }}
          />
        </div>
      </div>
    </div>
  );
}

function PhotosStep() {
  interface Errors {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    gender?: string;
  }
  const participantData = useAppSelector((state) => state.services.participantData);
  const [errors, setErrors] = useState<Errors>({});

  const handleChange = async (field: any, value: any) => {
    try {
      await validationSchema.validateAt(field, { [field]: value });
      setErrors((prevErrors) => ({ ...prevErrors, [field]: undefined }));
      store.dispatch(setServiceParticipantData({ ...participantData, [field]: value }));
    } catch (error: any) {
      setErrors((prevErrors) => ({ ...prevErrors, [field]: error?.message }));
    }
  };

  const validationSchema = Yup.object().shape({
    first_name: Yup.string().required('First name is required'),
    last_name: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string()
      .matches(/^[0-9]+$/, 'Phone must be numeric')
      .min(10, 'Phone must be at least 10 digits')
      .required('Phone is required'),
    gender: Yup.string().required('Gender is required')
  });

  return (
    <div className="space-y-6">
      <div className="flex items-baseline flex-wrap gap-2.5 mb-4">
        <label className="form-label flex items-center gap-1 max-w-56">First name</label>
        <input
          className="input w-full"
          placeholder="First name"
          type="text"
          defaultValue={participantData?.first_name || ''}
          onChange={(e) => handleChange('first_name', e.target.value)}
        />
        {errors?.first_name && <p className="text-red-500 text-sm">{errors?.first_name}</p>}
      </div>

      <div className="flex items-baseline flex-wrap gap-2.5 mb-4">
        <label className="form-label flex items-center gap-1 max-w-56">Last name</label>
        <input
          className="input w-full"
          placeholder="Last name"
          type="text"
          defaultValue={participantData?.last_name || ''}
          onChange={(e) => handleChange('last_name', e.target.value)}
        />
        {errors?.last_name && <p className="text-red-500 text-sm">{errors?.last_name}</p>}
      </div>

      <div className="flex items-baseline flex-wrap gap-2.5 mb-4">
        <label className="form-label flex items-center gap-1 max-w-56">Gender</label>
        <Select
          onValueChange={(item) => handleChange('gender', item)}
          defaultValue={participantData?.gender || ''}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="male">MALE</SelectItem>
              <SelectItem value="female">FEMALE</SelectItem>
              <SelectItem value="others">OTHERS</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors?.gender && <p className="text-red-500 text-sm">{errors?.gender}</p>}
      </div>

      <div className="flex items-baseline flex-wrap gap-2.5 mb-4">
        <label className="form-label flex items-center gap-1 max-w-56">Email</label>
        <input
          className="input w-full"
          placeholder="abc@gmail.com"
          type="email"
          defaultValue={participantData?.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
        />
        {errors?.email && <p className="text-red-500 text-sm">{errors?.email}</p>}
      </div>

      <div className="flex items-baseline flex-wrap gap-2.5 mb-4">
        <label className="form-label flex items-center gap-1 max-w-56">Phone</label>
        <input
          className="input w-full"
          type="text"
          defaultValue={participantData?.phone || ''}
          onChange={(e) => handleChange('phone', e.target.value)}
        />
        {errors?.phone && <p className="text-red-500 text-sm">{errors?.phone}</p>}
      </div>
    </div>
  );
}

function PricingStep() {
  const { serviceDetails } = useAppSelector((state) => state.services);

  const ageOptions = [
    'Mature Age (60+ years)',
    'Adults (22-59 years)',
    'Young people (17-21 years)',
    'Children (8-16 years)',
    'Early Childhood (0-7 years)'
  ];
  const initialAge =
    serviceDetails && serviceDetails.length > 0 ? serviceDetails[0] : ageOptions[0];
  const [selectedAge, setSelectedAge] = useState<string>(initialAge);

  useEffect(() => {
    store.dispatch(setServiceDetails([selectedAge]));
    store.dispatch(setUpdateWizardData());
  }, [selectedAge]);

  const handleSelection = (age: string) => {
    setSelectedAge(age);
  };

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
