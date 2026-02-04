import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Search, MapPin, User, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAppSelector } from '@/redux/hooks';
import ReactSelect from 'react-select';
import * as Yup from 'yup';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
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
import { Container } from '@/components';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { getProviderCount } from '@/services/api/directory';
import { Textarea } from '@/components/ui/textarea';
import AustralianSuburbSearch from '@/components/AUSuburubs';
import { cn } from '@/lib/utils';

/* ──────────── Step Indicator ──────────── */

const STEP_META = [
  { icon: Search, label: 'Service' },
  { icon: MapPin, label: 'Location' },
  { icon: User, label: 'Participant' },
  { icon: Settings, label: 'Details' },
];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-xl mx-auto mb-8">
      {STEP_META.slice(0, total).map((step, i) => {
        const Icon = step.icon;
        const isCompleted = i < current;
        const isCurrent = i === current;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center relative">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 border-2',
                  isCompleted
                    ? 'bg-primary border-primary text-white'
                    : isCurrent
                      ? 'border-primary text-primary bg-purple-50'
                      : 'border-gray-200 text-gray-400 bg-white'
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
              </div>
              <span
                className={cn(
                  'text-xs mt-1.5 font-medium whitespace-nowrap absolute -bottom-5',
                  isCompleted || isCurrent ? 'text-primary' : 'text-gray-400'
                )}
              >
                {step.label}
              </span>
            </div>
            {i < total - 1 && (
              <div className="flex-1 mx-2">
                <div className="h-0.5 rounded-full bg-gray-200 relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-500"
                    style={{ width: isCompleted ? '100%' : '0%' }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ──────────── Provider Count Badge ──────────── */

function ProviderBadge({ count, loading }: { count: number; loading: boolean }) {
  return (
    <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-full px-4 py-1.5">
      <span className="text-sm text-gray-600">Providers available</span>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
      ) : (
        <span className="text-sm font-bold text-primary">{count}</span>
      )}
    </div>
  );
}

/* ──────────── Main Wizard ──────────── */

export default function AirbnbWizard() {
  const { selectedServiceId, serviceLocation, participantData, wizardData } = useAppSelector(
    (state) => state.services
  );
  const { currentUser } = useAuthContext();
  const [finishLoading, setFinishLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [countLoading, setCountLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [availableProvidersCount, setAvailableProvidersCount] = useState(0);

  useEffect(() => {
    store.dispatch(setServiceLocation(''));
  }, []);

  const toggleModal = () => setShowModal(!showModal);

  const steps = [
    { title: 'Choose a Service', description: 'Select the type of NDIS service you need', component: <ServiceStep /> },
    { title: 'Your Location', description: 'Enter your suburb or postcode to find nearby providers', component: <LocationStep /> },
    { title: 'Participant Details', description: 'Tell us about the person who needs this service', component: <ParticipantStep /> },
    { title: 'Final Details', description: 'Select age group and how you\'d like the service delivered', component: <DetailsStep /> },
  ];

  const handleSubmit = async () => {
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
        setAvailableProvidersCount(0);
      }
    }
  };

  const isNextDisabled = () => {
    switch (currentStep) {
      case 0: return !selectedServiceId;
      case 1: return !serviceLocation?.latitude || !serviceLocation?.longitude || availableProvidersCount === 0;
      case 2: return !participantData.first_name || !participantData.email || !participantData.phone;
      case 3: return wizardData?.length <= 0;
      default: return false;
    }
  };

  const nextStep = async () => {
    if (currentStep === steps.length - 1) {
      await handleSubmit();
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const fetchProviderCount = async () => {
    if (!selectedServiceId) return;
    setCountLoading(true);
    try {
      let res;
      if (currentStep === 0) {
        res = await getProviderCount(selectedServiceId);
      } else {
        const hasCoordinates = serviceLocation?.latitude && serviceLocation?.longitude;
        if (!hasCoordinates) { setAvailableProvidersCount(0); return; }
        res = await getProviderCount(selectedServiceId, parseFloat(serviceLocation.latitude!), parseFloat(serviceLocation.longitude!));
      }
      setAvailableProvidersCount(res);
    } catch { setAvailableProvidersCount(0); } finally { setCountLoading(false); }
  };

  useEffect(() => {
    if (selectedServiceId) {
      if (currentStep === 0) fetchProviderCount();
      else if (currentStep === 1 && serviceLocation?.latitude && serviceLocation?.longitude) fetchProviderCount();
    }
  }, [selectedServiceId, currentStep, serviceLocation?.latitude, serviceLocation?.longitude]);

  useEffect(() => {
    if (availableProvidersCount === 0 && currentStep !== 0) toggleModal();
  }, [availableProvidersCount]);

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      {/* No Providers Modal */}
      <Dialog open={showModal} onOpenChange={toggleModal}>
        <DialogContent className="p-8">
          <div className="flex flex-col gap-4 justify-center items-center">
            <img
              src={`${import.meta.env.VITE_APP_AWS_URL}/man-helping-woman-for-carrier.png`}
              className="object-cover h-60"
            />
            <div className="text-center text-lg font-semibold text-black">
              Unfortunately, we are unable to locate any providers who can meet your current requirements.
            </div>
            <div className="text-pretty text-sm text-gray-700">
              Please consider modifying your requirements or browse our directory of providers to find a suitable match.
            </div>
            <div className="flex justify-center gap-6">
              <Link className="btn btn-primary" to={'/directory'}>Browse Directory</Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Container>
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Find Services</h1>
            <p className="text-sm text-gray-500 mt-1">Complete the steps below to connect with NDIS providers</p>
          </div>

          {/* Provider Badge */}
          <div className="flex justify-center mb-6">
            <ProviderBadge count={availableProvidersCount} loading={countLoading} />
          </div>

          {/* Step Indicator */}
          <StepIndicator current={currentStep} total={steps.length} />

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-1 mb-6 mt-10">
            <div
              className="h-1 bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Card */}
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-6 sm:p-8">
              {/* Step Title */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-primary bg-purple-50 px-2 py-0.5 rounded-full">
                    Step {currentStep + 1} of {steps.length}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{steps[currentStep].title}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{steps[currentStep].description}</p>
              </div>

              {/* Step Content */}
              <div className="min-h-[280px]">
                {steps[currentStep].component}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-100">
                <Button
                  variant="ghost"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>

                <Button
                  onClick={nextStep}
                  disabled={isNextDisabled() || finishLoading}
                  className="bg-primary hover:bg-primary/90 text-white px-6"
                >
                  {finishLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {currentStep === steps.length - 1 ? 'Submit Request' : 'Continue'}
                  {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </>
  );
}

/* ──────────── Step 1: Service Selection ──────────── */

function ServiceStep() {
  const { transformedServicesList, selectedServiceId } = useAppSelector((state) => state.services);

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-gray-700">Select a service</label>
      <ReactSelect
        value={transformedServicesList.find((item: any) => item.value === selectedServiceId) || null}
        options={transformedServicesList}
        onChange={(item: any) => store.dispatch(setSelectedServiceId(item.value))}
        placeholder="Search or select a service..."
        className="text-sm"
        styles={{
          control: (provided, state) => ({
            ...provided,
            borderColor: state.isFocused ? '#752C84' : '#e5e7eb',
            borderWidth: '1px',
            borderRadius: '0.5rem',
            boxShadow: state.isFocused ? '0 0 0 2px rgba(117,44,132,0.1)' : 'none',
            '&:hover': { borderColor: state.isFocused ? '#752C84' : '#d1d5db' },
            minHeight: '2.75rem',
            padding: '0 0.25rem',
          }),
          option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#752C84' : state.isFocused ? '#faf5ff' : 'transparent',
            color: state.isSelected ? '#fff' : state.isFocused ? '#752C84' : '#111827',
            '&:hover': { backgroundColor: state.isSelected ? '#752C84' : '#faf5ff', color: state.isSelected ? '#fff' : '#752C84' },
            padding: '0.625rem 0.75rem',
          }),
          placeholder: (provided) => ({ ...provided, color: '#9ca3af' }),
        }}
      />
      {selectedServiceId ? (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <Check className="w-3 h-3" /> Service selected
        </p>
      ) : (
        <p className="text-xs text-gray-400">Choose a service to see available providers</p>
      )}
    </div>
  );
}

/* ──────────── Step 2: Location ──────────── */

function LocationStep() {
  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-gray-700">
        Enter your <span className="text-primary font-semibold">suburb or postcode</span>
      </label>
      <AustralianSuburbSearch />
    </div>
  );
}

/* ──────────── Step 3: Participant ──────────── */

function ParticipantStep() {
  interface Errors { [key: string]: string | undefined; }
  const participantData = useAppSelector((state) => state.services.participantData);
  const [errors, setErrors] = useState<Errors>({});

  const validationSchema = Yup.object().shape({
    first_name: Yup.string().required('First name is required'),
    last_name: Yup.string().required('Last name is required'),
    description: Yup.string(),
    zip_code: Yup.string(),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string().matches(/^[0-9]+$/, 'Phone must be numeric').min(10, 'At least 10 digits').required('Phone is required'),
    gender: Yup.string().required('Gender is required'),
  });

  const handleChange = async (field: string, value: string) => {
    try {
      await validationSchema.validateAt(field, { [field]: value });
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      store.dispatch(setServiceParticipantData({ ...participantData, [field]: value }));
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, [field]: error?.message }));
    }
  };

  const inputClasses = 'w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10';

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-gray-700 mb-1">Who needs this service?</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">First name *</label>
          <input className={inputClasses} placeholder="First name" defaultValue={participantData?.first_name || ''} onChange={(e) => handleChange('first_name', e.target.value)} />
          {errors?.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Last name</label>
          <input className={inputClasses} placeholder="Last name" defaultValue={participantData?.last_name || ''} onChange={(e) => handleChange('last_name', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Email *</label>
          <input className={inputClasses} type="email" placeholder="email@example.com" defaultValue={participantData?.email || ''} onChange={(e) => handleChange('email', e.target.value)} />
          {errors?.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Phone *</label>
          <input className={inputClasses} placeholder="0400 000 000" defaultValue={participantData?.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} />
          {errors?.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Gender *</label>
          <Select onValueChange={(item) => handleChange('gender', item)} defaultValue={participantData?.gender || ''}>
            <SelectTrigger className="h-[42px] rounded-lg border-gray-200">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="others">Other</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors?.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Postal code</label>
          <input className={inputClasses} placeholder="e.g. 3000" defaultValue={participantData?.zip_code || ''} onChange={(e) => handleChange('zip_code', e.target.value)} />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Description (optional)</label>
        <Textarea
          name="description"
          placeholder="Tell us about the service you need..."
          className="rounded-lg border-gray-200 focus:border-primary min-h-[80px]"
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </div>
    </div>
  );
}

/* ──────────── Step 4: Details ──────────── */

function DetailsStep() {
  const { serviceDetails } = useAppSelector((state) => state.services);

  const ageOptions = [
    { label: 'Early Childhood', desc: '0–7 years' },
    { label: 'Children', desc: '8–16 years' },
    { label: 'Young People', desc: '17–21 years' },
    { label: 'Adults', desc: '22–59 years' },
    { label: 'Mature Age', desc: '60+ years' },
  ];

  const accessMethods = [
    { label: 'We come to you', icon: '🏠' },
    { label: 'You come to us', icon: '🏢' },
    { label: 'Online service', icon: '💻' },
    { label: 'Telehealth', icon: '📱' },
    { label: 'Group', icon: '👥' },
  ];

  const ageValues = ageOptions.map((a) => `${a.label} (${a.desc})`);
  const accessValues = accessMethods.map((a) => a.label);

  const initialAge = serviceDetails && serviceDetails.length > 0 ? serviceDetails[0] : ageValues[0];
  const [selectedAge, setSelectedAge] = useState<string>(initialAge);
  const [selectedAccess, setSelectedAccess] = useState<string>(accessValues[0]);

  useEffect(() => {
    store.dispatch(setServiceDetails([selectedAge]));
    store.dispatch(setAccessMethods([selectedAccess]));
    store.dispatch(setUpdateWizardData());
  }, [selectedAge, selectedAccess]);

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-3">Participant's age range</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ageOptions.map((age) => {
            const val = `${age.label} (${age.desc})`;
            const isActive = selectedAge === val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => setSelectedAge(val)}
                className={cn(
                  'rounded-lg border-2 px-3 py-3 text-left transition-all duration-200',
                  isActive
                    ? 'border-primary bg-purple-50 ring-1 ring-primary/20'
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                )}
              >
                <span className={cn('text-sm font-medium block', isActive ? 'text-primary' : 'text-gray-900')}>
                  {age.label}
                </span>
                <span className="text-xs text-gray-400">{age.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-3">Service delivery method</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {accessMethods.map((method) => {
            const isActive = selectedAccess === method.label;
            return (
              <button
                key={method.label}
                type="button"
                onClick={() => setSelectedAccess(method.label)}
                className={cn(
                  'rounded-lg border-2 px-3 py-3 text-center transition-all duration-200',
                  isActive
                    ? 'border-primary bg-purple-50 ring-1 ring-primary/20'
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                )}
              >
                <span className="text-lg block mb-0.5">{method.icon}</span>
                <span className={cn('text-sm font-medium', isActive ? 'text-primary' : 'text-gray-900')}>
                  {method.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
