import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DataGrid,
  DataGridColumnHeader,
  KeenIcon,
  TDataGridRequestParams,
  Menu,
  MenuIcon,
  MenuLink,
  MenuSub,
  MenuTitle,
  MenuItem,
  MenuToggle
} from '@/components';
import { ColumnDef, Column, RowSelectionState } from '@tanstack/react-table';

import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

import { IServiceRequestsData, ModalFilters } from './';
import { useAuthContext } from '@/auth';
import { getAllConnectedServiceRequests, getInteresetedInRequest } from '@/services/api';
import { useLanguage } from '@/i18n';
import { ICustomerServiceRequestsData } from '@/pages/service-requests/manage-customer-service-requests/blocks';
import { format } from 'date-fns';

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

const DropdownCard2 = (handleInterestedRequest: any, row: any) => {
  const { isRTL } = useLanguage();
  return (
    <MenuSub className="menu-default" rootClassName="w-full max-w-[200px]">
      {row.service_request_provider.length <= 0 && (
        <MenuItem
          onClick={() => handleInterestedRequest(row.id)}
          toggle="dropdown"
          dropdownProps={{
            placement: isRTL() ? 'left-start' : 'right-start',
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: isRTL() ? [15, 0] : [-15, 0] // [skid, distance]
                }
              }
            ]
          }}
        >
          <MenuLink>
            <MenuIcon>
              <KeenIcon icon="check" />
            </MenuIcon>
            <MenuTitle>I'm Interested</MenuTitle>
          </MenuLink>
        </MenuItem>
      )}
      <MenuItem
        toggle="dropdown"
        dropdownProps={{
          placement: isRTL() ? 'left-start' : 'right-start',
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: isRTL() ? [15, 0] : [-15, 0] // [skid, distance]
              }
            }
          ]
        }}
      >
        <MenuLink path={`/service-request/request/${row.id}`}>
          <MenuIcon>
            <KeenIcon icon="eye" />
          </MenuIcon>
          <MenuTitle>View Request</MenuTitle>
        </MenuLink>
      </MenuItem>
    </MenuSub>
  );
};

const ServiceRequestsTable = () => {
  const { currentUser } = useAuthContext();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

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

      const response = await getAllConnectedServiceRequests(
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

  const handleInterestedRequest = async (service_request_id: any) => {
    if (currentUser?.provider_company_id) {
      const res = await getInteresetedInRequest(
        currentUser?.provider_company_id,
        service_request_id
      );
      if (res) {
        navigate(`/service-request/request/${service_request_id}`);
      }
    } else {
      console.log('company is present');
    }
  };

  const columns = useMemo<ColumnDef<ICustomerServiceRequestsData>[]>(
    () => [
      {
        accessorFn: (row: ICustomerServiceRequestsData) => row.id,
        id: 'created_at',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Date Added"
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
                  {row.original.created_at ? format(row.original.created_at, 'LLL dd, y') : '--'}
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
            title="Participant Name"
            column={column}
            icon={<i className="ki-filled ki-user"></i>}
          />
        ),
        cell: (info) => {
          return (
            <div className="flex items-center text-gray-800 font-normal gap-1.5">
              {`${info.row.original?.first_name || ''} ${info.row.original?.last_name || ''}`}
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
              {info.row.original.service_request_provider.length === 0
                ? 'Open'
                : info.row.original.service_request_provider.length > 0
                  ? info.row.original.service_request_provider[0].status
                  : ''}
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
              {info.row.original.service.name}
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[180px]'
        }
      },
      {
        accessorFn: (row) => row.address,
        id: 'location',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Location"
            column={column}
            icon={<i className="ki-filled ki-geolocation"></i>}
          />
        ),
        cell: (info) => {
          return (
            <div className="flex items-center text-gray-800 font-normal gap-1.5">
              {info.row.original.address}
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[180px]'
        }
      },
      {
        accessorFn: (row) => row.address,
        id: 'location',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Contacted"
            column={column}
            icon={<i className="ki-filled ki-geolocation"></i>}
          />
        ),
        cell: (info) => {
          return (
            <div className="flex items-center text-gray-800 font-normal gap-1.5">
              {info.row.original.service_request_provider?.[0]?.customer_contacted ? (
                <div className="badge badge-pill badge-success">Yes</div>
              ) : (
                <div className="badge badge-pill badge-danger">No</div>
              )}
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[180px]'
        }
      },
      {
        id: 'click',
        header: () => '',
        enableSorting: false,
        cell: (row) => (
          <Menu className="items-stretch">
            <MenuItem
              toggle="dropdown"
              trigger="click"
              dropdownProps={{
                placement: isRTL() ? 'bottom-start' : 'bottom-end',
                modifiers: [
                  {
                    name: 'offset',
                    options: {
                      offset: isRTL() ? [0, -10] : [0, 10] // [skid, distance]
                    }
                  }
                ]
              }}
            >
              <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
                <KeenIcon icon="dots-vertical" />
              </MenuToggle>
              {DropdownCard2(handleInterestedRequest, row.row.original)}
            </MenuItem>
          </Menu>
        ),
        meta: {
          headerClassName: 'w-[60px]'
        }
      }
    ],
    [isRTL]
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
        <h3 className="card-title font-medium text-sm">Service Requests</h3>

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

          <div className="flex flex-wrap gap-2.5">
            <button className="btn btn-sm btn-outline btn-primary" onClick={handleModalOpen}>
              <KeenIcon icon="setting-4" /> Filters
            </button>
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

export { ServiceRequestsTable };
