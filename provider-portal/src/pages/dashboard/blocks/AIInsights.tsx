import { KeenIcon } from '@/components';

const AIInsights = () => {
  return (
    <div className="card mb-5 bg-gray-900 text-white">
      <div className="card-body">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center size-12 rounded-lg bg-primary">
            <KeenIcon icon="abstract-26" className="text-xl" />
          </div>
          <h3 className="text-lg font-semibold">AI Insights for Behaviour Support</h3>
        </div>
        <div className="flex items-center gap-3 text-gray-300">
          <KeenIcon icon="rocket" />
          <span>Select a participant to generate AI-powered insights.</span>
        </div>
      </div>
    </div>
  );
};

export { AIInsights };
