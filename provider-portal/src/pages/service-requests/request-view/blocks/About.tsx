import React from 'react';

interface IAboutTable {
  status: string;
  info: string | React.JSX.Element;
}
interface IAboutTables extends Array<IAboutTable> {}

const About = ({ data }: any) => {
  const tables: IAboutTables = [
    {
      status: 'Name',
      info: data?.first_name || ''
    },
    { status: 'Last Name:', info: data?.last_name || '' },
    { status: 'Gender:', info: data?.gender || '' },
    { status: 'Address:', info: data?.address || '' },
    // { status: 'City:', info: data?.city || '' },
    // { status: 'State:', info: data?.state || '' },
    { status: 'Postcode:', info: data?.zip_code || '' },
    {
      status: 'Age Range:',
      info: Array.isArray(data?.age_group_options)
        ? data.age_group_options.join(', ')
        : data?.age_group_options || ''
    },
    {
      status: 'Access Method:',
      info: Array.isArray(data?.service_delivered_options)
        ? data.service_delivered_options.join(', ')
        : data?.service_delivered_options || ''
    }
  ];

  const renderGridItem = (table: IAboutTable, index: number) => {
    return (
      <div key={index} className="grid-item">
        <div className="text-sm text-gray-600 pb-1">{table.status}</div>
        <div
          className="text-sm text-gray-900 pb-3.5"
          dangerouslySetInnerHTML={{ __html: table.info }}
        />
      </div>
    );
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Participant Information</h3>
      </div>

      <div className="card-body pt-4 pb-3">
        <div className="grid grid-cols-3 gap-4">
          {tables.map((table, index) => {
            return renderGridItem(table, index);
          })}
        </div>
      </div>
    </div>
  );
};

export { About, type IAboutTable, type IAboutTables };
