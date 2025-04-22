import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DataGrid,
  DataGridColumnHeader,
  KeenIcon,
  TDataGridRequestParams,
  Menu,
  MenuItem,
  MenuToggle
} from '@/components';
import { MenuIcon, MenuLink, MenuSub, MenuTitle } from '@/components';
import { ColumnDef, Column, RowSelectionState } from '@tanstack/react-table';

import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

import { useAuthContext } from '@/auth';
import { deleteDocument, getDocuments } from '@/services/api/documents';
import { Button } from '@/components/ui/button';
import { IDocumentsData } from '@/pages/documents/manage-documents/blocks';
import { getCustomerWishlist } from '@/services/api/wishlist-favourite';
import { ICompanyProfile, IWishlistTableProps } from './types';

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

const WishlistTable = () => {
  const { currentUser } = useAuthContext();
  const [refreshKey, setRefreshKey] = useState(0);

  const DropdownCard2 = (row: IWishlistTableProps) => {
    return (
      <MenuSub className="menu-default" rootClassName="w-full max-w-[200px]">
        <MenuItem
          toggle="dropdown"
          dropdownProps={{
            placement: 'left-start',
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [15, 0] // [skid, distance]
                }
              }
            ]
          }}
        >
          <MenuLink>
            <a
              href={`/provider-profile/${row.provider_company.id}`}
              className="flex"
              target="_blank"
            >
              <MenuIcon>
                <KeenIcon icon="notepad-edit" />
              </MenuIcon>
              <MenuTitle>View Provider</MenuTitle>
            </a>
          </MenuLink>
        </MenuItem>
        {/* <MenuItem
          onClick={() => handleDocDelete(row.id)}
          toggle="dropdown"
          dropdownProps={{
            placement: 'left-start',
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [15, 0] // [skid, distance]
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
              <MenuTitle>Delete Document</MenuTitle>
            </a>
          </MenuLink>
        </MenuItem> */}
      </MenuSub>
    );
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

      const response = await getCustomerWishlist(currentUser?.id, `${queryParams.toString()}`);

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

  const handleDocDelete = async (id: any) => {
    const res = await deleteDocument(id);
    if (res) {
      setRefreshKey((pre) => pre + 1);
    }
  };

  const columns = useMemo<ColumnDef<IWishlistTableProps>[]>(
    () => [
      {
        accessorFn: (row: IDocumentsData) => row.id,
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
        accessorFn: (row) => row.provider_company_id,
        id: 'provider_company_id',
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
              {info.row.original.provider_company.name || ''}
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[180px]'
        }
      },
      {
        accessorFn: (row) => row.provider_company.company_email,
        id: 'provider_company.company_email',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Provider Email"
            column={column}
            icon={<i className="ki-filled ki-user"></i>}
          />
        ),
        cell: (info) => {
          return (
            <div className="flex items-center flex-wrap text-gray-800 font-normal gap-1.5 break-all min-w-0">
              {info.row.original.provider_company.company_email || ''}
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[180px]'
        }
      },
      {
        accessorFn: (row) => row.provider_company.company_phone,
        id: 'provider_company.company_phone',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Provider Phone"
            column={column}
            icon={<i className="ki-filled ki-user"></i>}
          />
        ),
        cell: (info) => {
          return (
            <div className="flex items-center flex-wrap text-gray-800 font-normal gap-1.5 break-all min-w-0">
              {info.row.original.provider_company.company_phone || ''}
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
                placement: 'bottom-start',
                modifiers: [
                  {
                    name: 'offset',
                    options: {
                      offset: [0, -10] // [skid, distance]
                    }
                  }
                ]
              }}
            >
              <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
                <KeenIcon icon="dots-vertical" />
              </MenuToggle>
              {DropdownCard2(row.row.original)}
            </MenuItem>
          </Menu>
        ),
        meta: {
          headerClassName: 'w-[60px]'
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
        <h3 className="card-title font-medium text-sm">Wishlist</h3>

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
        key={refreshKey}
        columns={columns}
        serverSide={true}
        onFetchData={fetchRequests}
        rowSelection={true}
        onRowSelectionChange={handleRowSelection}
        pagination={{ size: 5 }}
        toolbar={<Toolbar />}
        layout={{ card: true }}
      />
      {/* <ModalFilters open={isModalOpen} onOpenChange={handleModalClose} /> */}
    </>
  );
};

export { WishlistTable };
