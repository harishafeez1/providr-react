interface IServiceAreaItem {
  label: string;
}

interface ISuburb {
  name: string;
}

interface ILocation extends IServiceAreaItem {
  suburbs: ISuburb[];
}

interface IServicesItem {
  name: string;
  dueDate: string;
  serviceArea: ILocation[];
}
interface IServicesItems extends Array<IServicesItem> {}

const Services = ({ data }: any) => {
  const renderItem = (item: any, index: number) => {
    return (
      <tr key={index}>
        <td className="text-start">
          <a href="#" className="text-sm font-medium text-gray-900 hover:text-primary">
            {item.service.name}
          </a>
        </td>

        <td>
          <div className="flex justify-end rtl:justify-start shrink-0">
            <div key={index} className="location">
              {/* {item.serviceArea.map((location, locIndex) => (
                <div key={locIndex} className="location">
                  <span className="badge badge-sm badge-gray-700">{location.label}</span>
                  <div className="suburbs">
                    {location.suburbs.map((suburb, subIndex) => (
                      <span key={subIndex} className="badge badge-xs badge-gray-100 mr-1">
                        {suburb.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))} */}
            </div>
          </div>
        </td>

        <td className="text-sm font-medium text-gray-700">{item.dueDate}</td>
      </tr>
    );
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Services</h3>
      </div>

      <div className="card-table scrollable-x-auto">
        <table className="table text-end">
          <thead>
            <tr>
              <th className="text-start min-w-52 !font-normal !text-gray-700">Service Name</th>
              <th className="min-w-32 !font-normal !text-gray-700">Service Areas</th>
              <th className="min-w-40 !font-normal !text-gray-700">Access Methods</th>
            </tr>
          </thead>

          <tbody>
            {data?.service_offerings?.map((item: any, index: number) => {
              return renderItem(item, index);
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { Services, type IServicesItem, type IServicesItems };
