import { KeenIcon } from '@/components';

interface BreakdownByType {
  physical: number;
  mechanical: number;
  chemical: number;
  seclusion: number;
  environmental: number;
}

interface BreakdownByTypeProps {
  breakdown: BreakdownByType | null;
}

const BreakdownByType = ({ breakdown }: BreakdownByTypeProps) => {
  return (
    <div className="card mb-5">
      <div className="card-header">
        <h3 className="card-title">
          <KeenIcon icon="element-11" className="text-primary" />
          Breakdown by Type (Last 12 Months)
        </h3>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="bg-primary-light p-4 rounded-lg text-center hover:shadow-md transition-shadow duration-200 cursor-pointer border border-transparent hover:border-primary">
            <div className="text-2sm font-medium text-gray-700 mb-2">Physical</div>
            <div className="text-3xl font-semibold text-primary">{breakdown?.physical || 0}</div>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg text-center hover:shadow-md transition-shadow duration-200 cursor-pointer border border-transparent hover:border-gray-300">
            <div className="text-2sm font-medium text-gray-700 mb-2">Mechanical</div>
            <div className="text-3xl font-semibold text-gray-900">{breakdown?.mechanical || 0}</div>
          </div>
          <div className="bg-primary-light p-4 rounded-lg text-center hover:shadow-md transition-shadow duration-200 cursor-pointer border border-transparent hover:border-primary">
            <div className="text-2sm font-medium text-gray-700 mb-2">Chemical</div>
            <div className="text-3xl font-semibold text-primary">{breakdown?.chemical || 0}</div>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg text-center hover:shadow-md transition-shadow duration-200 cursor-pointer border border-transparent hover:border-gray-300">
            <div className="text-2sm font-medium text-gray-700 mb-2">Seclusion</div>
            <div className="text-3xl font-semibold text-gray-900">{breakdown?.seclusion || 0}</div>
          </div>
          <div className="bg-primary-light p-4 rounded-lg text-center hover:shadow-md transition-shadow duration-200 cursor-pointer border border-transparent hover:border-primary">
            <div className="text-2sm font-medium text-gray-700 mb-2">Environmental</div>
            <div className="text-3xl font-semibold text-primary">{breakdown?.environmental || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { BreakdownByType };
