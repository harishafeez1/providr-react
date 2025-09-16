import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataGrid, DataGridColumnHeader, KeenIcon, Menu, MenuItem, MenuToggle } from '@/components';
import { ColumnDef, Column, RowSelectionState, SortingState } from '@tanstack/react-table';
import { useLanguage } from '@/i18n';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { MenuIcon, MenuLink, MenuSub, MenuTitle } from '@/components';
import { IUsersData } from './';
import { ModalEdit } from './ModalEdit';
import { useAuthContext } from '@/auth';
import { deleteAUser, fetchAllUsers, updateUserRole } from '@/services/api';
import { ColumnFiltersState } from '@tanstack/react-table';
import { useAppSelector } from '@/redux/hooks';
import { store } from '@/redux/store';
import { setRefreshTable } from '@/redux/slices/users-slice';
import { ModalDeleteConfirmation } from '@/partials/modals/delete-confirmation';

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}
export type TDataGridRequestParams = {
  pageIndex: number;
  pageSize: number;
  sorting?: SortingState;
  columnFilters?: ColumnFiltersState;
};
const DropdownCard2 = (handleModalOpen: any, handleModalOpen2: any, row: any) => {
  const { isRTL } = useLanguage();
  return (
    <MenuSub className="menu-default" rootClassName="w-full max-w-[200px]">
      <MenuItem
        onClick={() => handleModalOpen2(row.id, row)}
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
              <KeenIcon icon="notepad-edit" />
            </MenuIcon>
            <MenuTitle>Change Roles</MenuTitle>
          </a>
        </MenuLink>
      </MenuItem>
      <MenuItem
        onClick={() => handleModalOpen(row.id)}
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
            <MenuTitle>Remove User</MenuTitle>
          </a>
        </MenuLink>
      </MenuItem>
    </MenuSub>
  );
};

const UsersTable = () => {
  const { currentUser } = useAuthContext();
  const [selectedUserId, setSelectedUserId] = useState<number>(0);
  const [tableRow, setTableRow] = useState({
    admin: 0,
    permission_billing: 0,
    permission_editor: 0,
    permission_intake: 0,
    permission_review: 0
  });
  const [roles, setRoles] = useState<Record<string, number>>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const { refreshTable } = useAppSelector((state) => state.users);
  useEffect(() => {
    if (refreshTable) {
      setRefreshKey((prev) => prev + 1);
    }
    store.dispatch(setRefreshTable(false));
  }, [refreshTable]);

  useEffect(() => {
    if (currentUser) {
      const rolesObject = {
        admin: tableRow.admin,
        permission_billing: tableRow.permission_billing,
        permission_editor: tableRow.permission_editor,
        permission_intake: tableRow.permission_intake,
        permission_review: tableRow.permission_review
      };
      setRoles(rolesObject);
    }
  }, [tableRow]);

  // const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async (params: TDataGridRequestParams) => {
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

      const response = await fetchAllUsers(
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);

  const handleModalClose2 = () => {
    setIsModalOpen2(false);
  };
  const handleModalOpen2 = (id: number, row: any) => {
    setSelectedUserId(id);
    setIsModalOpen2(true);
    setTableRow({ ...row });
  };
  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  const handleModalOpen = (id: number) => {
    setSelectedUserId(id);
    setIsModalOpen(true);
  };

  const columns = useMemo<ColumnDef<IUsersData>[]>(
    () => [
      {
        accessorFn: (row: IUsersData) => row.id,
        id: 'id',
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Username"
            filter={<ColumnInputFilter column={column} />}
            column={column}
            icon={<i className="ki-filled ki-user"></i>}
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
                  {`${row.original.first_name || ''} ${row.original.last_name || ''}`}
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
        accessorFn: (row) => row.email,
        id: 'email',
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Email"
            column={column}
            icon={<i className="ki-filled ki-sms"></i>}
          />
        ),
        cell: (row) => {
          return (
            <div className="flex items-center text-gray-800 font-normal gap-1.5">
              {row.row.original.email}
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[180px]'
        }
      },
      {
        accessorFn: (row) => row.admin,
        id: 'admin',
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Roles"
            column={column}
            icon={<i className="ki-filled ki-people"></i>}
          />
        ),
        cell: (row) => {
          return (
            <div className="flex flex-wrap gap-1">
              {row.row.original.admin == 1 && <label className="badge badge-sm">Admin</label>}
              {row.row.original.permission_billing == 1 && (
                <label className="badge badge-sm">Billing</label>
              )}
              {row.row.original.permission_editor == 1 && (
                <label className="badge badge-sm">Editor</label>
              )}
              {row.row.original.permission_intake == 1 && (
                <label className="badge badge-sm">Intake</label>
              )}
              {row.row.original.permission_review == 1 && (
                <label className="badge badge-sm">Review</label>
              )}
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[180px]'
        }
      },
      {
        accessorFn: (row) => row.active,
        id: 'actioned',
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Status"
            column={column}
            icon={<i className="ki-filled ki-flag"></i>}
          />
        ),
        cell: (info) => {
          return (
            <span>
              {info.row.original.active ? (
                <span className="badge badge-sm badge-success badge-outline">Active</span>
              ) : (
                <span className="badge badge-sm badge-warning badge-outline">Disabled</span>
              )}
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
              {DropdownCard2(handleModalOpen, handleModalOpen2, row.row.original)}
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

  // const Toolbar = ({ setSearchQuery }: { setSearchQuery: (query: string) => void }) => {
  //   const [inputValue, setInputValue] = useState(searchQuery);
  //   const { table } = useDataGrid();
  //   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //     if (e.key === 'Enter') {
  //       setSearchQuery(inputValue);
  //       if (inputValue.trim() === '') {
  //         // Remove the 'query' filter if input is empty
  //         table.setColumnFilters(
  //           table.getState().columnFilters.filter((filter) => filter.id !== 'query') // Exclude the filter with id 'query'
  //         );
  //       } else {
  //         // Add or update the 'query' filter
  //         table.setColumnFilters([
  //           ...table.getState().columnFilters.filter((filter) => filter.id !== 'query'), // Remove existing 'query' filter
  //           { id: 'query', value: inputValue } // Add the new filter
  //         ]);
  //       }
  //     }
  //   };
  //   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //     setInputValue(event.target.value); // Update local state
  //   };
  //   return (
  //     <div className="card-header border-b-0 px-5">
  //       <h3 className="card-title">Teams</h3>
  //       <div className="input input-sm max-w-48">
  //         <KeenIcon icon="magnifier" />
  //         <input
  //           type="text"
  //           placeholder="Search Teams"
  //           value={inputValue}
  //           onChange={handleChange}
  //           onKeyDown={handleKeyDown}
  //         />
  //       </div>
  //     </div>
  //   );
  // };
  const Toolbar = () => {
    return (
      <div className="card-header flex-wrap px-5 py-5 border-b-0">
        <h3 className="card-title">Users</h3>

        {/* <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex gap-6">
            <div className="relative">
              <KeenIcon
                icon="magnifier"
                className="leading-none text-md text-gray-500 absolute top-1/2 start-0 -translate-y-1/2 ms-3"
              />
              <input
                type="text"
                placeholder="Search User"
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
        serverSide={true}
        onFetchData={fetchUsers}
        rowSelection={true}
        getRowId={(row: any) => row.id}
        onRowSelectionChange={handleRowSelection}
        pagination={{ size: 5 }}
        layout={{ card: true }}
        toolbar={<Toolbar />}
      />

      <ModalDeleteConfirmation
        open={isModalOpen}
        onOpenChange={handleModalClose}
        onDeleteConfirm={async () => {
          await deleteAUser(selectedUserId);
          await fetchAllUsers(`${currentUser?.provider_company_id}`);
          handleModalClose();

          setRefreshKey((prev) => prev + 1);
        }}
      />
      <ModalEdit
        defaultCheckBoxes={roles || ''}
        open={isModalOpen2}
        onOpenChange={handleModalClose2}
        onSaveConfirm={async (data) => {
          try {
            await updateUserRole(selectedUserId, data);
            await fetchAllUsers(`${currentUser?.provider_company_id}`);
            setRefreshKey((prev) => prev + 1);
            handleModalClose2();
          } catch (err) {
            console.error('Error updating user role:', err);
          }
        }}
      />
    </>
  );
};

export { UsersTable };
