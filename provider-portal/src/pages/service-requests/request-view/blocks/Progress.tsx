import { Step, StepLabel, Stepper } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

const ProgressbarPoints = ({ data }: any) => {
  const HorizontalLinearAlternativeLabelStepper = () => {
    const [activeStepTab, setActiveStepTab] = useState(0);

    useEffect(() => {
      if (data?.service_request_provider?.length > 0) {
        data.service_request_provider?.[0].status === 'In Progress'
          ? setActiveStepTab(1)
          : data.service_request_provider?.[0].status === 'Completed'
            ? setActiveStepTab(2)
            : setActiveStepTab(0);
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
