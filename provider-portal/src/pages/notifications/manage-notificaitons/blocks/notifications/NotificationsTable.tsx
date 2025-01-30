import { useCallback, useMemo, useState } from 'react';
import { DataGrid, DataGridColumnHeader } from '@/components';
import { ColumnDef, Column, RowSelectionState } from '@tanstack/react-table';

import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

import { NotificationsData, INotificationsData } from './';

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

const NotificationsTable = () => {
  const [isEmail, setIsEmail] = useState(true);
  const [isSms, setIsSms] = useState(true);
  const handleToggleEmail = useCallback(() => {
    setIsEmail((prev) => !prev);
  }, []);

  const handleToggleSms = useCallback(() => {
    setIsSms((prev) => !prev);
  }, []);
  const ColumnInputFilter = <TData, TValue>({ column }: IColumnFilterProps<TData, TValue>) => {
    return (
      <Input
        placeholder="Filter..."
        value={(column.getFilterValue() as string) ?? ''}
        onChange={(event) => column.setFilterValue(event.target.value)}
        className="h-9 w-full max-w-40"
      />
    );
  };

  const columns = useMemo<ColumnDef<INotificationsData>[]>(
    () => [
      {
        accessorFn: (row: INotificationsData) => row,
        id: 'notification',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Notification"
            filter={<ColumnInputFilter column={column} />}
            column={column}
            icon={<i className="ki-filled ki-notification-on"></i>}
          />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <label>{row.original.notification.title}</label>
                {row.original.notification.description}
              </div>
            </div>
          );
        },
        meta: {
          className: 'min-w-[300px]',
          cellClassName: 'text-gray-800 font-normal'
        }
      },
      {
        accessorFn: (row) => row.isEmail,
        id: 'isEmail',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Email"
            column={column}
            icon={<i className="ki-filled ki-sms"></i>}
          />
        ),
        cell: (info) => {
          return (
            <label className="switch switch-sm p-3">
              <input
                className="order-1"
                type="checkbox"
                checked={info.row.original.isEmail}
                onChange={handleToggleEmail}
              />
            </label>
          );
        },
        meta: {
          headerClassName: 'min-w-[180px]'
        }
      },
      // {
      //   accessorFn: (row) => row.isSms,
      //   id: 'isSms',
      //   header: ({ column }) => (
      //     <DataGridColumnHeader
      //       title="SMS "
      //       column={column}
      //       icon={<i className="ki-filled ki-messages"></i>}
      //     />
      //   ),
      //   cell: (info) => {
      //     return (
      //       <label className="switch switch-sm p-3">
      //         <input
      //           className="order-1"
      //           type="checkbox"
      //           checked={info.row.original.isSms}
      //           disabled={info.row.original.isdisabled}
      //           onChange={handleToggleSms}
      //         />
      //       </label>
      //     );
      //   },
      //   meta: {
      //     headerClassName: 'min-w-[180px]'
      //   }
      // },
      {
        accessorFn: (row) => row.lastUpdated,
        id: 'lastUpdated',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Updated"
            column={column}
            icon={<i className="ki-filled ki-time"></i>}
          />
        ),
        cell: (info) => {
          return (
            <div className="flex items-center text-gray-800 font-normal gap-1.5">
              {info.row.original.lastUpdated}
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[180px]'
        }
      }
    ],
    [handleToggleEmail, handleToggleSms]
  );

  const data: INotificationsData[] = useMemo(() => NotificationsData, []);

  const handleRowSelection = (state: RowSelectionState) => {
    const selectedRowIds = Object.keys(state);
    if (selectedRowIds.length > 0) {
      toast(`Total ${selectedRowIds.length} are selected.`, {
        description: `Selected row IDs: ${selectedRowIds}`,
        action: {
          label: 'Undo',
          onClick: () => console.log('Undo')
        }
      });
    }
  };
  const Toolbar = () => {
    return (
      <div className="card-header flex-wrap px-5 py-5 border-b-0">
        <h3 className="card-title">Notifications</h3>
      </div>
    );
  };
  return (
    <>
      <DataGrid
        columns={columns}
        data={data}
        rowSelection={true}
        onRowSelectionChange={handleRowSelection}
        pagination={{ show: true }}
        layout={{ cellBorder: false, card: true }}
        toolbar={<Toolbar />}
      />
    </>
  );
};

export { NotificationsTable };
