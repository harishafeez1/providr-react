import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DataGrid,
  DataGridColumnHeader,
  KeenIcon,
  Menu,
  MenuItem,
  MenuToggle,
  TDataGridRequestParams
} from '@/components';
import { ColumnDef, Column, RowSelectionState } from '@tanstack/react-table';
import { MenuIcon, MenuLink, MenuSub, MenuTitle } from '@/components';

import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

import { IPremisesData } from './';
import { useLanguage } from '@/i18n';
import { useAuthContext } from '@/auth';
import { deletePremises, getAllPremises } from '@/services/api';
import { ModalDeleteConfirmation } from '@/partials/modals/delete-confirmation';

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}
const DropdownCard2 = (premisesId: string | number, handleModalOpen: any) => {
  const { isRTL } = useLanguage();

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
        <MenuLink path={`/premises/edit-premises/${premisesId}`}>
          <MenuIcon>
            <KeenIcon icon="notepad-edit" />
          </MenuIcon>
          <MenuTitle>Edit</MenuTitle>
        </MenuLink>
      </MenuItem>

      <MenuItem
        onClick={() => handleModalOpen(premisesId)}
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
    </MenuSub>
  );
};

const PremisesTable = () => {
  const { currentUser } = useAuthContext();
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedId, setSelectedId] = useState('');
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

  const fetchAllPremises = async (params: TDataGridRequestParams) => {
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

      const response = await getAllPremises(
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

  const { isRTL } = useLanguage();
  const columns = useMemo<ColumnDef<IPremisesData>[]>(
    () => [
      {
        accessorFn: (row: IPremisesData) => row.id,
        id: 'id',
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Name"
            filter={<ColumnInputFilter column={column} />}
            column={column}
            icon={<i className="ki-filled ki-user"></i>}
          />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <div className="text-2sm text-gray-700 font-normal">{row.original.name}</div>
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
        accessorFn: (row) => row.address_line_1,
        id: 'address_line_1',
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Address"
            column={column}
            icon={<i className="ki-filled ki-geolocation"></i>}
          />
        ),
        cell: (info) => {
          return (
            <div className="flex items-center text-gray-800 font-normal gap-1.5">
              {info.row.original.address_line_1}
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[180px]'
        }
      },
      {
        accessorFn: (row) => row.active,
        id: 'status',
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Active"
            column={column}
            icon={<i className="ki-filled ki-flag"></i>}
          />
        ),
        cell: (info) => {
          return (
            <span
              className={`badge badge-${info.row.original.active ? 'success' : 'danger'} badge-outline rounded-full`}
            >
              <span
                className={`px-2 rounded-full bg-${info.row.original.active ? 'Active' : 'Inactive'}`}
              >
                {info.row.original.active ? 'Active' : 'Inactive'}
              </span>
            </span>
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
              {DropdownCard2(row.row.original.id, handleModalOpen)}
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

  const handleDeletePremises = async () => {
    await deletePremises(selectedId);
  };
  const Toolbar = () => {
    return (
      <div className="card-header flex-wrap px-5 py-5 border-b-0">
        <h3 className="card-title">Premises</h3>

        {/* <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex gap-6">
            <div className="relative">
              <KeenIcon
                icon="magnifier"
                className="leading-none text-md text-gray-500 absolute top-1/2 start-0 -translate-y-1/2 ms-3"
              />
              <input
                type="text"
                placeholder="Search Premises"
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
        key={refreshKey}
        columns={columns}
        rowSelection={true}
        serverSide={true}
        onFetchData={fetchAllPremises}
        onRowSelectionChange={handleRowSelection}
        pagination={{ size: 5 }}
        layout={{ card: true }}
        toolbar={<Toolbar />}
      />
      <ModalDeleteConfirmation
        open={isModalOpen}
        onOpenChange={handleModalClose}
        onDeleteConfirm={async () => {
          await handleDeletePremises();
          setRefreshKey((prev) => prev + 1);
          handleModalClose();
        }}
      />
    </>
  );
};

export { PremisesTable };
