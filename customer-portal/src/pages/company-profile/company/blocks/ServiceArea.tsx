import clsx from 'clsx';

interface IServiceAreaItem {
  label: string;
}
interface IServiceAreaItems extends Array<IServiceAreaItem> {}

interface IServiceAreaProps {
  title: string;
  className?: string;
}

const ServiceArea = ({ title, className }: IServiceAreaProps) => {
  interface ISuburb {
    name: string;
  }

  interface ILocation extends IServiceAreaItem {
    suburbs: ISuburb[];
  }

  const items: ILocation[] = [
    { label: 'New York', suburbs: [{ name: 'Manhattan' }, { name: 'Brooklyn' }] },
    { label: 'Los Angeles', suburbs: [{ name: 'Hollywood' }, { name: 'Venice' }] },
    { label: 'Chicago', suburbs: [{ name: 'Lincoln Park' }, { name: 'Hyde Park' }] },
    { label: 'Houston', suburbs: [{ name: 'Downtown' }, { name: 'Midtown' }] }
  ];

  const renderItem = (item: ILocation, index: number) => {
    return (
      <div key={index} className="location">
        <span className="badge badge-sm badge-gray-700">{item.label}</span>
        <div className="suburbs">
          {item.suburbs.map((suburb, subIndex) => (
            <span key={subIndex} className="badge badge-xs badge-gray-100 mr-1">
              {suburb.name}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={clsx('card', className && className)}>
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
      </div>

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

export { ServiceArea, type IServiceAreaItem, type IServiceAreaItems, type IServiceAreaProps };
