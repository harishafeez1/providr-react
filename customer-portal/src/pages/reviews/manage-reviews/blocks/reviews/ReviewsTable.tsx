import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataGrid, DataGridColumnHeader, KeenIcon, TDataGridRequestParams } from '@/components';
import { ColumnDef, Column, RowSelectionState } from '@tanstack/react-table';

import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

import { IReviewsData, ModalFilters } from './';
import { useAuthContext } from '@/auth';
import { getReviews } from '@/services/api/reviews';
// import { getAllReviews } from '@/services/api';

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

const ReviewsTable = () => {
  const { currentUser } = useAuthContext();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
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

  const fetchRequests = async (params: TDataGridRequestParams) => {
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

      const response = await getReviews(`${queryParams.toString()}`);

      return {
        data: response.data,
        totalCount: response.total
      };
    } catch (error) {
      console.error(error);

      return {
        data: [],
        totalCount: 0
      };
    }
  };

  const columns = useMemo<ColumnDef<IReviewsData>[]>(
    () => [
      {
        accessorFn: (row: IReviewsData) => row.id,
        id: 'matchId',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="ID"
            filter={<ColumnInputFilter column={column} />}
            column={column}
            icon={<i className="ki-filled ki-barcode text-lg"></i>}
          />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <Link
                  to="#"
                  className="text-2sm text-gray-700 font-normal hover:text-primary-active"
                >
                  {row.original.id}
                </Link>
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
        accessorFn: (row) => row.customer_id,
        id: 'participantName',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Provider"
            column={column}
            icon={<i className="ki-filled ki-user"></i>}
          />
        ),
        cell: (info) => {
          return (
            <div className="flex items-center text-gray-800 font-normal gap-1.5">
              {info.row.original.provider_company.name}
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[180px]'
        }
      },
      {
        accessorFn: (row) => row.status,
        id: 'status',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Status"
            column={column}
            icon={<i className="ki-filled ki-flag"></i>}
          />
        ),
        cell: (info) => {
          return (
            <span
              className={`badge badge-${info.row.original.status ? 'success' : 'danger'} shrink-0 badge-outline rounded-[30px]`}
            >
              <span
                className={`size-1.5 rounded-full bg-${info.row.original.status ? 'success' : 'danger'} me-1.5`}
              ></span>
              {info.row.original.status ? 'Active' : 'Disabled'}
            </span>
          );
        },
        meta: {
          headerClassName: 'min-w-[180px]'
        }
      },
      {
        accessorFn: (row) => row.service_id,
        id: 'service',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Service"
            column={column}
            icon={<i className="ki-filled ki-courier text-lg"></i>}
          />
        ),
        cell: (info) => {
          return (
            <div className="flex items-center text-gray-800 font-normal gap-1.5">
              {info.row.original.service_offering.service.name}
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[180px]'
        }
      },
      {
        accessorFn: (row) => row.id,
        id: 'content',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Content"
            column={column}
            icon={<i className="ki-filled ki-message-text-2"></i>}
          />
        ),
        cell: (info) => {
          return (
            <div className="flex items-center text-gray-800 font-normal gap-1.5">
              {info.row.original.content}
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[180px]'
        }
      },
      {
        accessorFn: (row) => row.actioned_at,
        id: 'actioned',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Responded"
            column={column}
            icon={<i className="ki-filled ki-user-tick text-lg"></i>}
          />
        ),
        cell: (info) => {
          return (
            <div className="flex items-center text-gray-800 font-normal gap-1.5">
              {info.row.original.reply}
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[180px]'
        }
      }
    ],
    []
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
    const [searchInput, setSearchInput] = useState('');

    return (
      <div className="card-header flex-wrap gap-2 border-b-0 px-5">
        <h3 className="card-title font-medium text-sm">Reviews</h3>

        <div className="flex flex-wrap gap-2 lg:gap-5">
          <div className="flex">
            <label className="input input-sm">
              <KeenIcon icon="magnifier" />
              <input
                type="text"
                placeholder="Search users"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </label>
          </div>
        </div>
      </div>
    );
  };
  return (
    <>
      <DataGrid
        columns={columns}
        serverSide={true}
        onFetchData={fetchRequests}
        rowSelection={true}
        onRowSelectionChange={handleRowSelection}
        pagination={{ size: 5 }}
        toolbar={<Toolbar />}
        layout={{ card: true }}
      />
      <ModalFilters open={isModalOpen} onOpenChange={handleModalClose} />
    </>
  );
};

export { ReviewsTable };
