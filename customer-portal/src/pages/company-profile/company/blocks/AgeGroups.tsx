import clsx from 'clsx';

interface IAgeGroupsItem {
  label: string;
}
interface IAgeGroupsItems extends Array<IAgeGroupsItem> {}

interface IAgeGroupsProps {
  title: string;
  className?: string;
}

const AgeGroups = ({ title, className }: IAgeGroupsProps) => {
  const items: IAgeGroupsItems = [
    { label: 'Early Childhood (0-7 years)' },
    { label: 'Adults (22-59 years)' }
  ];

  const renderItem = (item: IAgeGroupsItem, index: number) => {
    return (
      <span key={index} className="badge badge-sm badge-gray-200">
        {item.label}
      </span>
    );
  };

  return (
    <div className={clsx('card', className && className)}>
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
      </div>
      {items.length === 0 && (
        <div className="card-body">
          <p>No data found</p>
        </div>
      )}

      <div className="card-body">
        <div className="flex flex-wrap gap-2.5 mb-2">
          {items.map((item, index) => {
            return renderItem(item, index);
          })}
        </div>
      </div>
    </div>
  );
};

export { AgeGroups, type IAgeGroupsItem, type IAgeGroupsItems, type IAgeGroupsProps };
