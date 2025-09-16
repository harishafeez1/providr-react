import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DataGrid, DataGridColumnHeader, KeenIcon, TDataGridRequestParams } from '@/components';
import { ColumnDef, Column, RowSelectionState } from '@tanstack/react-table';

import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

import { IReviewsData } from './';
import { useAuthContext } from '@/auth';
import { getAllReviews } from '@/services/api/reviews';
import { format } from 'date-fns';
import { CommonRating } from '@/partials/common';

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

const ReviewsTable = () => {
  const { currentUser } = useAuthContext();

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

  const fetchAllReviews = async (params: TDataGridRequestParams) => {
    if (!currentUser) {
      console.error('currentUser is undefined');
      return {
        data: [],
        totalCount: 0
      };
    }
    try {
      const queryParams = new URLSearchParams();

      queryParams.set('page', String(params.pageIndex + 1));
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

      const response = await getAllReviews(
        `${currentUser.provider_company_id}?${queryParams.toString()}`
      );

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
        id: 'id',
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Created"
            filter={<ColumnInputFilter column={column} />}
            column={column}
            icon={<i className="ki-filled ki-time"></i>}
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
                  {row.original.created_at ? format(row.original.created_at, 'LLL dd, y') : ''}
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
        id: 'customer_id',
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Author"
            column={column}
            icon={<i className="ki-filled ki-text"></i>}
          />
        ),
        cell: (info) => {
          return (
            <div className="flex items-center text-gray-800 font-normal gap-1.5">
              {`${info.row.original?.customer?.first_name ?? ''} ${info.row.original?.customer?.last_name ?? ''}`.trim()}
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[180px]'
        }
      },
      {
        accessorFn: (row) => row.rating,
        id: 'rating',
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Rating "
            column={column}
            icon={<i className="ki-filled ki-graph-3"></i>}
          />
        ),
        cell: (info) => {
          return (
            <span>
              {info.row.original.rating && (
                <CommonRating rating={info.row.original.rating as number} />
              )}
            </span>
          );
        },
        meta: {
          headerClassName: 'min-w-[180px]'
        }
      },
      {
        accessorFn: (row) => row.service_offering_id,
        id: 'service_offering_id',
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Reviewed Item"
            column={column}
            icon={<i className="ki-filled ki-archive-tick"></i>}
          />
        ),
        cell: (info) => {
          return (
            <div className="flex items-center text-gray-800 font-normal gap-1.5">
              {info.row.original?.service_offering?.service?.name || ''}
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[180px]'
        }
      },
      // {
      //   accessorFn: (row) => row.reply,
      //   id: 'reply',
      //   header: ({ column }) => (
      //     <DataGridColumnHeader
      //      filterable={false}
      //       title="Responded"
      //       column={column}
      //       icon={<i className="ki-filled ki-message-text"></i>}
      //     />
      //   ),
      //   cell: (info) => {
      //     return (
      //       <div className="flex items-center text-gray-800 font-normal gap-1.5">
      //         {info.row.original.reply}
      //       </div>
      //     );
      //   },
      //   meta: {
      //     headerClassName: 'min-w-[180px]'
      //   }
      // },
      {
        accessorFn: (row) => row.content,
        id: 'content',
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Contents"
            column={column}
            icon={<i className="ki-filled ki-element-1"></i>}
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
    return (
      <div className="card-header flex-wrap px-5 py-5 border-b-0">
        <h3 className="card-title">Reviews</h3>

        {/* <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex gap-6">
            <div className="relative">
              <KeenIcon
                icon="magnifier"
                className="leading-none text-md text-gray-500 absolute top-1/2 start-0 -translate-y-1/2 ms-3"
              />
              <input
                type="text"
                placeholder="Search Review"
                className="input input-sm ps-8"
                value={''}
                onChange={() => {}}
              />
            </div>
          </div>
        </div> */}
      </div>
    );
  };
  return (
    <>
      <DataGrid
        serverSide={true}
        columns={columns}
        onFetchData={fetchAllReviews}
        rowSelection={true}
        onRowSelectionChange={handleRowSelection}
        pagination={{ size: 5 }}
        toolbar={<Toolbar />}
        layout={{ card: true }}
      />
    </>
  );
};

export { ReviewsTable };
