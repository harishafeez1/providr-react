import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export default function AirbnbWizard() {
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
      title: 'Requirement',
      description: 'Who needs this service?',
      component: <PhotosStep />
    },
    {
      title: 'Details',
      description: 'A few more final details',
      component: <PricingStep />
    }
  ];

  const nextStep = () => {
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
        <CardFooter className="border-t pt-6 flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="btn btn-secondary"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={nextStep}
            disabled={currentStep === steps.length}
            className="btn btn-primary"
          >
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
function BasicInfoStep() {
  const [service, setService] = useState('');

  const suggestions = ['Cleaning', 'Plumbing', 'Electrical', 'Painting', 'Carpentry'];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Service Information</h3>
        <div className="flex items-baseline flex-wrap gap-2.5 mb-4">
          <label className="form-label flex items-center gap-1 max-w-56">Select a service</label>
          <input
            className="input w-full"
            placeholder="Select a service"
            type="text"
            value={service}
            onChange={(e) => setService(e.target.value)}
          />
        </div>
      </div>
      <div>
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
      </div>
    </div>
  );
}

function LocationStep() {
  return (
    <div className="space-y-6">
      <div className="flex items-baseline flex-wrap gap-2.5 mb-4">
        <label className="form-label flex items-center gap-1 max-w-56">
          Enter the service location
        </label>
        <input className="input w-full" placeholder="Enter Your Suburb Or Postcode" type="text" />
      </div>
    </div>
  );
}

function PhotosStep() {
  return (
    <div className="space-y-6">
      <div className="flex items-baseline flex-wrap gap-2.5 mb-4">
        <label className="form-label flex items-center gap-1 max-w-56">What is your name?</label>
        <input className="input w-full" placeholder="First name will be okay!" type="text" />
      </div>
      <div className="flex items-baseline flex-wrap gap-2.5 mb-4">
        <label className="form-label flex items-center gap-1 max-w-56">
          What is your client name?
        </label>
        <input
          className="input w-full"
          placeholder="First name will be okay! (if you are thr client Enter your name)"
          type="text"
        />
      </div>
      <div className="flex items-baseline flex-wrap gap-2.5 mb-4">
        <label className="form-label flex items-center gap-1 max-w-56">
          Where should we send the results?
        </label>
        <input className="input w-full" placeholder="Enter Your Email Address" type="text" />
      </div>
      <label className="form-label flex items-center gap-1 max-w-56">Select who this is for</label>
      <div className="grid grid-cols-3 gap-4">
        <label className="flex items-center justify-center border text-center bg-no-repeat bg-cover border-gray-300 rounded-xl has-[:checked]:border-primary has-[:checked]:border-2 [&_.checked]:has-[:checked]:flex h-[70px] mb-0.5">
          <input
            className="appearance-none"
            type="radio"
            name="appearance_option"
            defaultChecked={true}
            value="2"
          />
          <label className="text-center text-md">Myself</label>
        </label>

        <label className="flex items-center justify-center border text-center bg-no-repeat bg-cover border-gray-300 rounded-xl has-[:checked]:border-primary has-[:checked]:border-2 [&_.checked]:has-[:checked]:flex h-[70px] mb-0.5">
          <input
            className="appearance-none"
            type="radio"
            name="appearance_option"
            defaultChecked={true}
            value="2"
          />
          <label className="text-center text-md">Someone I care for</label>
        </label>
        <label className="flex items-center justify-center border text-center bg-no-repeat bg-cover border-gray-300 rounded-xl has-[:checked]:border-primary has-[:checked]:border-2 [&_.checked]:has-[:checked]:flex h-[70px] mb-0.5">
          <input
            className="appearance-none"
            type="radio"
            name="appearance_option"
            defaultChecked={true}
            value="2"
          />
          <label className="text-center text-md">Enter Your Email Address</label>
        </label>
      </div>
    </div>
  );
}

function PricingStep() {
  return (
    <div className="space-y-6">
      <label className="form-label flex items-center gap-1 max-w-56">Particiapnts age range</label>
      <div className="grid grid-cols-3 gap-4">
        <label className="flex items-center justify-center border text-center bg-no-repeat bg-cover border-gray-300 rounded-xl has-[:checked]:border-primary has-[:checked]:border-2 [&_.checked]:has-[:checked]:flex h-[70px] mb-0.5">
          <input
            className="appearance-none"
            type="radio"
            name="appearance_option"
            defaultChecked={true}
            value="2"
          />
          <label className="text-center text-md">Mature Age (60+ years)</label>
        </label>

        <label className="flex items-center justify-center border text-center bg-no-repeat bg-cover border-gray-300 rounded-xl has-[:checked]:border-primary has-[:checked]:border-2 [&_.checked]:has-[:checked]:flex h-[70px] mb-0.5">
          <input
            className="appearance-none"
            type="radio"
            name="appearance_option"
            defaultChecked={true}
            value="2"
          />
          <label className="text-center text-md">Adults (22-59 years)</label>
        </label>
        <label className="flex items-center justify-center border text-center bg-no-repeat bg-cover border-gray-300 rounded-xl has-[:checked]:border-primary has-[:checked]:border-2 [&_.checked]:has-[:checked]:flex h-[70px] mb-0.5">
          <input
            className="appearance-none"
            type="radio"
            name="appearance_option"
            defaultChecked={true}
            value="2"
          />
          <label className="text-center text-md">Young people (17-21 years)</label>
        </label>
        <label className="flex items-center justify-center border text-center bg-no-repeat bg-cover border-gray-300 rounded-xl has-[:checked]:border-primary has-[:checked]:border-2 [&_.checked]:has-[:checked]:flex h-[70px] mb-0.5">
          <input
            className="appearance-none"
            type="radio"
            name="appearance_option"
            defaultChecked={true}
            value="2"
          />
          <label className="text-center text-md">Children (8-16 years)</label>
        </label>
        <label className="flex items-center justify-center border text-center bg-no-repeat bg-cover border-gray-300 rounded-xl has-[:checked]:border-primary has-[:checked]:border-2 [&_.checked]:has-[:checked]:flex h-[70px] mb-0.5">
          <input
            className="appearance-none"
            type="radio"
            name="appearance_option"
            defaultChecked={true}
            value="2"
          />
          <label className="text-center text-md">Early Childhood (0-7 years)</label>
        </label>
      </div>
      <label className="form-label flex items-center gap-1 max-w-56">
        Who manages the NDIS plan
      </label>
      <div className="grid grid-cols-3 gap-4">
        <label className="flex items-center justify-center border text-center bg-no-repeat bg-cover border-gray-300 rounded-xl has-[:checked]:border-primary has-[:checked]:border-2 [&_.checked]:has-[:checked]:flex h-[70px] mb-0.5">
          <input
            className="appearance-none"
            type="radio"
            name="appearance_option1"
            defaultChecked={true}
            value="3"
          />
          <label className="text-center text-md">Plan managed</label>
        </label>

        <label className="flex items-center justify-center border text-center bg-no-repeat bg-cover border-gray-300 rounded-xl has-[:checked]:border-primary has-[:checked]:border-2 [&_.checked]:has-[:checked]:flex h-[70px] mb-0.5">
          <input
            className="appearance-none"
            type="radio"
            name="appearance_option1"
            defaultChecked={true}
            value="3"
          />
          <label className="text-center text-md">Self managed</label>
        </label>
        <label className="flex items-center justify-center border text-center bg-no-repeat bg-cover border-gray-300 rounded-xl has-[:checked]:border-primary has-[:checked]:border-2 [&_.checked]:has-[:checked]:flex h-[70px] mb-0.5">
          <input
            className="appearance-none"
            type="radio"
            name="appearance_option1"
            defaultChecked={true}
            value="3"
          />
          <label className="text-center text-md">Agency managed</label>
        </label>
        <label className="flex items-center justify-center border text-center bg-no-repeat bg-cover border-gray-300 rounded-xl has-[:checked]:border-primary has-[:checked]:border-2 [&_.checked]:has-[:checked]:flex h-[70px] mb-0.5">
          <input
            className="appearance-none"
            type="radio"
            name="appearance_option1"
            defaultChecked={true}
            value="3"
          />
          <label className="text-center text-md">Waiting for approval </label>
        </label>
        <label className="flex items-center justify-center border text-center bg-no-repeat bg-cover border-gray-300 rounded-xl has-[:checked]:border-primary has-[:checked]:border-2 [&_.checked]:has-[:checked]:flex h-[70px] mb-0.5">
          <input
            className="appearance-none"
            type="radio"
            name="appearance_option1"
            defaultChecked={true}
            value="3"
          />
          <label className="text-center text-md">Not with NDIS</label>
        </label>
        <label className="flex items-center justify-center border text-center bg-no-repeat bg-cover border-gray-300 rounded-xl has-[:checked]:border-primary has-[:checked]:border-2 [&_.checked]:has-[:checked]:flex h-[70px] mb-0.5">
          <input
            className="appearance-none"
            type="radio"
            name="appearance_option1"
            defaultChecked={true}
            value="3"
          />
          <label className="text-center text-md">Unsure</label>
        </label>
      </div>
    </div>
  );
}
