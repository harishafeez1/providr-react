import { useCallback, useEffect, useMemo, useState } from 'react';
import { DataGrid, DataGridColumnHeader, TDataGridRequestParams } from '@/components';
import { ColumnDef, Column, RowSelectionState } from '@tanstack/react-table';

import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

import { INotificationsData } from './';
import { useAuthContext } from '@/auth';
import { getAllNotifications, updateNotificationsSetting } from '@/services/api/notifications';
import { store } from '@/redux/store';
import { setNotificationsList } from '@/redux/slices/notifications-slice';
import { useAppSelector } from '@/redux/hooks';

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

const NotificationsTable = () => {
  const { currentUser } = useAuthContext();
  const [refreshKey, setRefreshKey] = useState(0);

  const [isSms, setIsSms] = useState(true);
  // const handleToggleEmail = useCallback(() => {
  //   setIsEmail((prev) => !prev);
  // }, []);

  const handleToggleSms = useCallback(() => {
    setIsSms((prev) => !prev);
  }, []);

  const handleToggleEmail = async (row: any) => {
    setRefreshKey((pre) => pre + 1);
    await updateNotificationsSetting(currentUser?.provider_company_id, {
      name: row.name,
      active: row.active ? 0 : 1
    });
  };

  const fetchNotifications = async (params: TDataGridRequestParams) => {
    if (!currentUser) {
      console.error('currentUser is undefined');
      return {
        data: [],
        totalCount: 0
      };
    }
    try {
      const queryParams = new URLSearchParams();

      queryParams.set('page', String(params.pageIndex + 1)); // Page is 1-indexed on server
      queryParams.set('per_page', String(params.pageSize));
      if (params.sorting?.[0]?.id) {
        queryParams.set('sort', params.sorting[0].id);
        queryParams.set('order', params.sorting[0].desc ? 'desc' : 'asc');
      }

      // if (searchQuery.trim().length > 0) {
      //   queryParams.set('query', searchQuery);
      // }

      if (params.columnFilters) {
        params.columnFilters.forEach(({ id, value }) => {
          if (value !== undefined && value !== null) {
            queryParams.set(`filter[${id}]`, String(value));
          }
        });
      }

      const response = await getAllNotifications(currentUser?.provider_company_id);

      return {
        data: response,
        totalCount: response?.total
      };
    } catch (error) {
      console.error(error);

      return {
        data: [],
        totalCount: 0
      };
    }
  };

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
        id: 'name',
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
                <label className="card-title">{row.original.name}</label>
                {row.original.description}
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
        accessorFn: (row) => row.active,
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
                className=""
                name={info.row.original.name}
                type="checkbox"
                checked={info.row.original.active}
                onChange={() => {
                  handleToggleEmail(info.row.original);
                }}
              />
            </label>
          );
        },
        meta: {
          headerClassName: 'min-w-[180px]'
        }
      }
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
      // {
      //   accessorFn: (row) => row.lastUpdated,
      //   id: 'lastUpdated',
      //   header: ({ column }) => (
      //     <DataGridColumnHeader
      //       title="Updated"
      //       column={column}
      //       icon={<i className="ki-filled ki-time"></i>}
      //     />
      //   ),
      //   cell: (info) => {
      //     return (
      //       <div className="flex items-center text-gray-800 font-normal gap-1.5">
      //         {info.row.original.lastUpdated}
      //       </div>
      //     );
      //   },
      //   meta: {
      //     headerClassName: 'min-w-[180px]'
      //   }
      // }
    ],
    [handleToggleEmail, handleToggleSms]
  );

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
        key={refreshKey}
        serverSide
        columns={columns}
        onFetchData={fetchNotifications}
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
