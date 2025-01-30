import clsx from 'clsx';

interface IAccessMethodsItem {
  label: string;
}
interface IAccessMethodsItems extends Array<IAccessMethodsItem> {}

interface IAccessMethodsProps {
  title: string;
  className?: string;
}

const AccessMethods = ({ title, className }: IAccessMethodsProps) => {
  const items: IAccessMethodsItems = [];

  const renderItem = (item: IAccessMethodsItem, index: number) => {
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
  AccessMethods,
  type IAccessMethodsItem,
  type IAccessMethodsItems,
  type IAccessMethodsProps
};
