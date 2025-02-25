interface IAboutTable {
  status: string;
  info: string;
}
interface IAboutTables extends Array<IAboutTable> {}

const About = () => {
  const tables: IAboutTables = [
    { status: 'Name', info: '32' },
    { status: 'Last Name:', info: 'Amsterdam' },
    { status: 'Gender:', info: 'North Holland' },
    { status: 'Age Range:', info: 'N/A' },
    { status: 'City:', info: '1092 NL' },
    { status: 'State:', info: '1092 NL' },
    { status: 'Postcode:', info: '1092 NL' },
    { status: 'Telehealth:', info: 'N/A' },
    { status: 'Online Service:', info: 'N/A' }
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
