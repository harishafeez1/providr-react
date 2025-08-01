import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataGrid, DataGridColumnHeader, KeenIcon, TDataGridRequestParams } from '@/components';
import { ColumnDef, Column, RowSelectionState } from '@tanstack/react-table';
import { format } from 'date-fns';

import { MenuIcon, MenuLink, MenuSub, MenuTitle } from '@/components';
import { IServiceOfferingsData } from './';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Menu, MenuItem, MenuToggle } from '@/components';
import { useLanguage } from '@/i18n';
import { useAuthContext } from '@/auth';
import {
  activeDeactiveServiceOffering,
  deleteServiceOfferings,
  getAllServiceOfferings
} from '@/services/api/service-offerings';
import { ModalDeleteConfirmation } from '@/partials/modals/delete-confirmation';

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

const DropdownCard2 = (id: any, handleModalOpen: any, row: any, setRefreshKey: any) => {
  const { isRTL } = useLanguage();

  const handleActiveDeactive = (row: any) => {
    activeDeactiveServiceOffering(row?.id, row?.active ? 0 : 1);
    setRefreshKey((prev: any) => prev + 1);
  };

  return (
    <MenuSub className="menu-default" rootClassName="w-full max-w-[200px]">
      <MenuItem
        toggle="dropdown"
        trigger="hover"
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
        <MenuLink path={`/service-offering/edit-service/${id}`}>
          <MenuIcon>
            <KeenIcon icon="notepad-edit" />
          </MenuIcon>
          <MenuTitle>Edit</MenuTitle>
        </MenuLink>
      </MenuItem>

      <MenuItem
        onClick={() => handleModalOpen(id)}
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
          <a className="flex">
            <MenuIcon>
              <KeenIcon icon="trash" />
            </MenuIcon>
            <MenuTitle>Delete</MenuTitle>
          </a>
        </MenuLink>
      </MenuItem>

      <MenuItem
        onClick={() => handleActiveDeactive(row)}
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
          <a className="flex">
            <MenuIcon>
              <KeenIcon icon="toggle-off-circle" />
            </MenuIcon>
            <MenuTitle>{row?.active === 1 ? 'Deactivate' : 'Activate'}</MenuTitle>
          </a>
        </MenuLink>
      </MenuItem>
    </MenuSub>
  );
};

const ServiceOfferingsTable = () => {
  const { currentUser } = useAuthContext();

  const [selectedId, setSelectedId] = useState('');

  const [refreshKey, setRefreshKey] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  const handleModalOpen = (id: any) => {
    setSelectedId(id);
    setIsModalOpen(true);
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
  const { isRTL } = useLanguage();

  const fetchServiceOfferings = async (params: TDataGridRequestParams) => {
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

      const response = await getAllServiceOfferings(
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

  const columns = useMemo<ColumnDef<IServiceOfferingsData>[]>(
    () => [
      {
        accessorFn: (row: IServiceOfferingsData) => row.service.name,
        id: 'service_id',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Service Offering"
            filter={<ColumnInputFilter column={column} />}
            column={column}
            icon={<i className="ki-filled ki-price-tag"></i>}
          />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <Link
                  to="#"
                  className="text-2sm text-gray-700 font-normal hover:text-primary-active"
                >
                  {row.original.service.name}
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
        accessorFn: (row) => row.active,
        id: 'status',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Status"
            column={column}
            icon={<i className="ki-filled ki-check-circle"></i>}
          />
        ),
        enableSorting: true,
        cell: (info) => {
          return (
            <span
              className={`badge badge-${info.row.original.active ? 'success' : 'danger'} shrink-0 badge-outline rounded-[30px]`}
            >
              <span
                className={`size-1.5 rounded-full bg-${info.row.original.active ? 'success' : 'danger'} me-1.5`}
              ></span>
              {info.row.original.active ? 'Active' : 'Disabled'}
            </span>
          );
        },
        meta: {
          headerClassName: 'min-w-[180px]'
        }
      },
      {
        accessorFn: (row) => row.created_at,
        id: 'created_at',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Added on"
            column={column}
            icon={<i className="ki-filled ki-time"></i>}
          />
        ),
        enableSorting: true,
        cell: (info) => {
          return (
            <div className="flex items-center text-gray-800 font-normal gap-1.5">
              {info.row.original.created_at
                ? format(info.row.original.created_at, 'LLL dd, y')
                : '--'}
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[180px]'
        }
      },
      {
        accessorFn: (row) => row.service_delivered_options,
        id: 'accessMethod',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Access Methods"
            column={column}
            icon={
              <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="fad"
                data-icon="hands"
                className="svg-inline--fa fa-hands h-4"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 576 512"
                style={{ fontSize: '16px', marginTop: '2px', color: 'rgb(38, 79, 115)' }}
              >
                <g className="fa-duotone-group">
                  <path
                    className="fa-secondary"
                    fill="currentColor"
                    d="M544 160c0-17.7-14.3-32-32-32s-32 14.3-32 32l-.1 49.3L426.1 116l0 0 0 0L368.6 16.5C362 5 347.3 1.1 335.8 7.7s-15.4 21.3-8.8 32.8l51.5 89.1c3.3 5.7 1.3 13.1-4.4 16.4s-13.1 1.3-16.4-4.4L290.3 24.8C283.6 13.3 269 9.4 257.5 16s-15.4 21.3-8.8 32.8l45.9 79.5c9.4 1 18.7 4.1 27.3 9.4l60.2 37.6C443 213.4 480 280.2 480 352v8c0 1.9 0 3.8-.1 5.7c40.1-32.1 64-80.9 64-133.1L544 160zm-275.5-29L243.9 88.5c-6.6-11.5-21.3-15.4-32.8-8.8s-15.4 21.3-8.8 32.8l28.9 50c.8-1.5 1.6-3 2.5-4.4c8.4-13.4 20.8-22.6 34.7-27zm-44.1 67.5l-26.8-46.4c-6.6-11.5-21.3-15.4-32.8-8.8s-15.4 21.3-8.8 32.8L179 216h31.8l0 0H224h4.7c-2.2-5.6-3.7-11.4-4.3-17.4z"
                  ></path>
                  <path
                    className="fa-primary"
                    fill="currentColor"
                    d="M305 164.9c-15-9.4-34.7-4.8-44.1 10.2s-4.8 34.7 10.2 44.1L317.2 248H224l0 0 0 0H88c-13.3 0-24 10.7-24 24s10.7 24 24 24H212c6.6 0 12 5.4 12 12s-5.4 12-12 12H56c-13.3 0-24 10.7-24 24s10.7 24 24 24H212c6.6 0 12 5.4 12 12s-5.4 12-12 12H88c-13.3 0-24 10.7-24 24s10.7 24 24 24H212c6.6 0 12 5.4 12 12s-5.4 12-12 12H120c-13.3 0-24 10.7-24 24s10.7 24 24 24H296c83.9 0 152-68.1 152-152v-8c0-60.8-31.3-117.3-82.9-149.5L305 164.9z"
                  ></path>
                </g>
              </svg>
            }
          />
        ),
        enableSorting: true,
        cell: (info) => {
          return (
            <div className="flex items-center text-gray-800 font-normal gap-1.5">
              <div className="flex flex-wrap gap-2">
                {info.row.original.service_delivered_options ? (
                  info.row.original.service_delivered_options.map(
                    (option: string, index: number) => (
                      <span key={index} className="badge badge-sm">
                        {option}
                      </span>
                    )
                  )
                ) : (
                  <span className="badge badge-sm bg-gray-100 text-gray-800">N/A</span>
                )}
              </div>
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[180px]',
          cellClassName: 'text-gray-800 font-normal'
        }
      },
      {
        id: 'click',
        header: () => '',
        enableSorting: false,
        cell: (info) => (
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
              {DropdownCard2(
                info.row.original.id,
                handleModalOpen,
                info.row.original,
                setRefreshKey
              )}
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

  // const data: IServiceOfferingsData[] = useMemo(() => ServiceOfferingsData, []);

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
        <h3 className="card-title">Service Offering</h3>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex gap-6">
            <div className="relative">
              <KeenIcon
                icon="magnifier"
                className="leading-none text-md text-gray-500 absolute top-1/2 start-0 -translate-y-1/2 ms-3"
              />
              <input
                type="text"
                placeholder="Search Service"
                className="input input-sm ps-8"
                value={''}
                onChange={() => {}}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <DataGrid
        key={refreshKey}
        columns={columns}
        serverSide={true}
        onFetchData={fetchServiceOfferings}
        rowSelection={true}
        onRowSelectionChange={handleRowSelection}
        pagination={{ size: 5 }}
        sorting={[{ id: 'users', desc: false }]}
        toolbar={<Toolbar />}
        layout={{ card: true }}
      />
      <ModalDeleteConfirmation
        open={isModalOpen}
        onOpenChange={handleModalClose}
        onDeleteConfirm={async () => {
          await deleteServiceOfferings(selectedId);
          setRefreshKey((prev) => prev + 1);
          handleModalClose();
        }}
      />
    </>
  );
};

export { ServiceOfferingsTable };
