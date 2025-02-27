import { format } from 'date-fns';

interface IAboutTable {
  status: string;
  info: string;
}
interface IAboutTables extends Array<IAboutTable> {}

const UnlockPartnerships = ({ data }: any) => {
  const tables: IAboutTables = [
    { status: 'Match ID:', info: data.id },
    // { status: 'Updated By:', info: 'Amsterdam' },
    { status: 'Created:', info: data.created_at ? format(data.created_at, 'LLL dd, y') : '' }
  ];
  const renderTable = (table: IAboutTable, index: number) => {
    return (
      <tr key={index}>
        <td className="text-sm text-gray-600 pb-3.5 pe-3">{table.status}</td>
        <td
          className="text-sm text-gray-900 pb-3.5"
          dangerouslySetInnerHTML={{ __html: table.info }}
        />
      </tr>
    );
  };

  return (
    <div className="card">
      <div className="card-body px-10 py-7.5 lg:pe-12.5">
        <div className="flex flex-wrap md:flex-nowrap items-center gap-6 md:gap-10">
          <div className="flex flex-col gap-3">
            <h2 className="text-1.5xl font-semibold text-gray-900">
              {data?.address ? data.address : ''}
              <p className="text-xl font-bold text-primary">
                Service: {data?.service ? data?.service?.name : ''}
              </p>
            </h2>

            <table className="table-auto">
              <tbody>
                {data &&
                  tables.map((table, index) => {
                    return renderTable(table, index);
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export { UnlockPartnerships };
