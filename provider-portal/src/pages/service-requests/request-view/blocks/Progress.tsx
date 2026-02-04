import { Step, StepLabel, Stepper } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

const ProgressbarPoints = ({ data }: any) => {
  const HorizontalLinearAlternativeLabelStepper = () => {
    const [activeStepTab, setActiveStepTab] = useState(0);

    useEffect(() => {
      if (data?.service_request_provider?.length > 0 && !Boolean(data?.direct_connect)) {
        const provider = data.service_request_provider[0];

        if (provider.status === 'In Progress' && !Boolean(provider.customer_contacted)) {
          setActiveStepTab(1);
        } else if (Boolean(provider.customer_contacted)) {
          setActiveStepTab(2);
        } else {
          setActiveStepTab(0);
        }
      } else {
        if (Boolean(data?.direct_connect) && data.status === 'Pending') {
          setActiveStepTab(1);
        } else if (Boolean(data?.direct_connect) && data.status === 'Completed') {
          setActiveStepTab(2);
        }
      }
    }, [data]);

    const steps = ['Open', 'In Progress', 'Completed'];

    return (
      <div className="w-full">
        <Stepper className="w-full" alternativeLabel activeStep={activeStepTab}>
          {steps.map((label) => (
            <Step className="bg-white" key={label}>
              <StepLabel sx={{ color: 'red' }}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </div>
    );
  };
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Your progress</h3>
      </div>
      <div className="card-body">
        <div className="grid gap-2.5 ">
          <div className="progress w-[100%]">
            <HorizontalLinearAlternativeLabelStepper />
          </div>
        </div>
      </div>
    </div>
  );
};

export { ProgressbarPoints };
