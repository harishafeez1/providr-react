interface IProjectProps {
  name: string;
  description: string;
  progress?: {
    variant: string;
    value: number;
  };
  footer?: string;
  value?: number;

  credits?: {
    denominator: number;
    numerator: number;
  };
  updateDate?: string;
}

const CardProject = ({ name, progress, footer, credits, value, updateDate }: IProjectProps) => {
  return (
    <>
      {progress ? (
        <div className="card p-4">
          <div className="flex flex-col mb-2 lg:mb-2">
            <a className="text-5xl font-media/brand text-gray-900 hover:text-primary-active mb-px">
              {credits?.numerator}/{credits?.denominator}
            </a>
            <span className="text-sm text-gray-700">{name}</span>
            <span className="text-sm text-gray-700">Reset on:{updateDate}</span>
          </div>

          <div className={`progress h-1.5 ${progress.variant} mb-2 lg:mb-2`}>
            <div className="progress-bar" style={{ width: `${progress.value}%` }}></div>
          </div>

          <div className="card-footer mt-2">
            <span className="text-sm text-gray-700">{footer}</span>
          </div>
        </div>
      ) : (
        <div className="card p-4">
          <div className="flex flex-col mb-2 lg:mb-2">
            <a className="text-6xl font-media/brand text-gray-900 hover:text-primary-active mb-px">
              {value}
            </a>
            <span className="text-sm text-gray-700">{name}</span>
          </div>

          <div className="card-footer mt-2">
            <span className="text-sm text-gray-700">{footer}</span>
          </div>
        </div>
      )}
    </>
  );
};

export { CardProject, type IProjectProps };
