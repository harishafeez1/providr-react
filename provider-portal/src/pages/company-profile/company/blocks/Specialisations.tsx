import clsx from 'clsx';

interface ISpecialisationsItem {
  label: string;
}
interface ISpecialisationsItems extends Array<ISpecialisationsItem> {}

interface ISpecialisationsProps {
  title: string;
  className?: string;
}

const Specialisations = ({ title, className }: ISpecialisationsProps) => {
  const items: ISpecialisationsItems = [];

  const renderItem = (item: ISpecialisationsItem, index: number) => {
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

export {
  Specialisations,
  type ISpecialisationsItem,
  type ISpecialisationsItems,
  type ISpecialisationsProps
};
