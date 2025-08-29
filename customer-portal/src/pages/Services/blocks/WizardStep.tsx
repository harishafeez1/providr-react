import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Search } from 'lucide-react';
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
  setAccessMethods,
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
import { Container, Modal, ModalBody, ModalContent, ModalHeader } from '@/components';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { getProviderCount } from '@/services/api/directory';
import { Textarea } from '@/components/ui/textarea';
import AustralianSuburbSearch from '@/components/AUSuburubs';

export default function AirbnbWizard() {
  const { selectedServiceId, serviceLocation, participantData, wizardData } = useAppSelector(
    (state) => state.services
  );
  const { auth, currentUser, setCurrentUser, getUser, saveAuth } = useAuthContext();
  const [finishLoading, setFinishLoading] = useState(false);
  const [countQuery, setCountQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [countLoading, setCountLoading] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);
  const [availableProvidersCount, setAvailableProvidersCount] = useState(0);

  // Clear location when component mounts to prevent cached location issues
  useEffect(() => {
    store.dispatch(setServiceLocation(''));
  }, []);

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
        return (
          !serviceLocation?.latitude || !serviceLocation?.longitude || availableProvidersCount === 0
        ); // Disable if coordinates are not available or no providers available
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

  const fetchProviderCount = async () => {
    if (!selectedServiceId) return;

    setCountLoading(true);
    try {
      let res;

      if (currentStep === 0) {
        // First step: only send service_id (no location data)
        res = await getProviderCount(selectedServiceId);
      } else {
        // Second step and beyond: send service_id + location data
        const hasCoordinates = serviceLocation?.latitude && serviceLocation?.longitude;

        if (!hasCoordinates) {
          // If we're past step 0 but don't have coordinates, can't get accurate count
          setAvailableProvidersCount(0);
          return;
        }

        const latitude = parseFloat(serviceLocation.latitude!);
        const longitude = parseFloat(serviceLocation.longitude!);
        res = await getProviderCount(selectedServiceId, latitude, longitude);
      }

      setAvailableProvidersCount(res);
    } catch (error) {
      console.error('Error fetching provider count:', error);
      setAvailableProvidersCount(0);
    } finally {
      setCountLoading(false);
    }
  };

  useEffect(() => {
    // Trigger provider count API on both first and second steps
    if (selectedServiceId) {
      if (currentStep === 0) {
        // First step: service selected, send only service_id
        fetchProviderCount();
      } else if (currentStep === 1 && serviceLocation?.latitude && serviceLocation?.longitude) {
        // Second step: location selected, send service_id + coordinates
        fetchProviderCount();
      }
    }
  }, [selectedServiceId, currentStep, serviceLocation?.latitude, serviceLocation?.longitude]);

  useEffect(() => {
    if (availableProvidersCount === 0 && currentStep !== 0) {
      toggleModal();
    }
  }, [availableProvidersCount]);

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
              <Link className="btn btn-primary" to={'/directory'}>
                Browse Directory
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Container>
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-0">
            {/* <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-semibold text-gray-900">Find Services</h1>

              <div className="flex items-center gap-6 ">
                <div className="font-semibold">Available Providers</div>
                {countLoading ? (
                  <div className="rounded-full h-3 w-3 bg-primary animate-ping mx-3"></div>
                ) : (
                  <div className="border-primary rounded-full border-2 font-semibold px-2">
                    {availableProvidersCount}
                  </div>
                )}
              </div>
            </div> */}
            <div className="flex w-full justify-center items-center mb-8 relative">
              <div className="absolute top-0 -left-24 bg-primary h-14 w-[10%] rounded-s-2xl flex justify-center items-center [clip-path:polygon(70%_0%,95%_50%,70%_100%,0%_100%,0%_50%,0%_0%)]">
                <Search size={26} color="white" className="" />
              </div>
              {steps.map((step, index) => (
                <div key={index} className="flex flex-1 justify-center items-center -me-14">
                  <div
                    className={`w-full flex justify-center items-center 
                    ${
                      index < currentStep
                        ? 'bg-primary text-white'
                        : index === currentStep
                          ? '[clip-path:polygon(75%_0%,85%_50%,75%_100%,0%_100%,10%_50%,0%_0%)] bg-primary text-white h-14 '
                          : '[clip-path:polygon(75%_0%,85%_50%,75%_100%,0%_100%,10%_50%,0%_0%)] bg-gray-300 text-black h-14 '
                    }`}
                  >
                    {step.title}
                  </div>
                </div>
              ))}
              <div className="absolute top-0 -right-40 [clip-path:polygon(33%_0%,100%_0%,100%_100%,33%_100%,45%_50%)] bg-primary h-14 w-[20%] rounded-e-2xl flex justify-center items-center text-white">
                Provider Found
              </div>
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
              </Button>
            </div>
          </CardFooter>
        </Card>
      </Container>
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

  return (
    <div className="space-y-6">
      <div className="flex items-baseline flex-wrap gap-2.5 mb-4">
        <label className="form-label flex items-center gap-1">
          Enter the service location <strong className="text-primary">suburb or postcode</strong>
        </label>
        <div className="w-full">
          <AustralianSuburbSearch />
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
    zip_code?: string;
    description?: string;
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
    description: Yup.string(),
    zip_code: Yup.string(),
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
        <label className="form-label flex items-center gap-1 max-w-56">Postal code</label>
        <input
          className="input w-full"
          placeholder=""
          type="text"
          defaultValue={participantData?.zip_code || ''}
          onChange={(e) => handleChange('zip_code', e.target.value)}
        />
        {errors?.zip_code && <p className="text-red-500 text-sm">{errors?.zip_code}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="form-label text-gray-900">Short Description</label>
        <Textarea
          name="description"
          placeholder="Tell us about your service request"
          onChange={(e) => handleChange('description', e.target.value)}
        />
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

  const accessMethods = [
    'Group',
    'Online service',
    'Telehealth',
    'We come to you',
    'You come to us'
  ];

  const initialAge =
    serviceDetails && serviceDetails.length > 0 ? serviceDetails[0] : ageOptions[0];
  const [selectedAge, setSelectedAge] = useState<string>(initialAge);
  const [selectedAccessMethod, setSelectedAccessMethod] = useState<string>(accessMethods[0]);

  useEffect(() => {
    store.dispatch(setServiceDetails([selectedAge]));
    store.dispatch(setAccessMethods([selectedAccessMethod]));
    store.dispatch(setUpdateWizardData());
  }, [selectedAge, selectedAccessMethod]);

  return (
    <div className="space-y-6">
      {/* Age Options */}
      <div className="space-y-2">
        <label className="form-label flex items-center gap-1 max-w-56">
          Participants age range
        </label>
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
                onChange={() => setSelectedAge(age)}
              />
              <span className="text-center text-md">{age}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Access Methods */}
      <div className="space-y-2">
        <label className="form-label flex items-center gap-1 max-w-56">Service access method</label>
        <div className="grid grid-cols-3 gap-4">
          {accessMethods.map((method) => (
            <label
              key={method}
              className={`flex items-center justify-center border text-center bg-no-repeat bg-cover border-gray-300 rounded-xl h-[70px] mb-0.5 cursor-pointer 
              ${selectedAccessMethod === method ? 'border-primary bg-[#8a4099] text-white border-2' : ''}`}
            >
              <input
                className="appearance-none"
                type="radio"
                name="access_method"
                value={method}
                checked={selectedAccessMethod === method}
                onChange={() => setSelectedAccessMethod(method)}
              />
              <span className="text-center text-md">{method}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
