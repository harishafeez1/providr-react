import { Step, StepLabel, Stepper } from '@mui/material';
import 'leaflet/dist/leaflet.css';

const ProgressbarPoints = () => {
  const HorizontalLinearAlternativeLabelStepper = () => {
    const steps = ['Request Received ', 'in progress ', 'complete'];

    return (
      <div className="w-full">
        <Stepper className="w-full" alternativeLabel activeStep={1}>
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
