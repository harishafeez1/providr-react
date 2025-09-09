import { useMemo, useState } from 'react';
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

import { IDocumentsData, ModalFilters } from './';
import { useAuthContext } from '@/auth';
import { deleteDocument, getDocuments } from '@/services/api/documents';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

const DocumentsTable = () => {
  const { currentUser } = useAuthContext();
  const [refreshKey, setRefreshKey] = useState(0);

  const DropdownCard2 = (row: any) => {
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
              href={`${import.meta.env.VITE_APP_AWS_URL}/${row.document_path}`}
              className="flex"
              target="_blank"
            >
              <MenuIcon>
                <KeenIcon icon="notepad-edit" />
              </MenuIcon>
              <MenuTitle>View Document</MenuTitle>
            </a>
          </MenuLink>
        </MenuItem>
        <MenuItem
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
        </MenuItem>
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

      const response = await getDocuments(`${queryParams.toString()}`);

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

  const handleDocDelete = async (id: any) => {
    const res = await deleteDocument(id);
    if (res) {
      setRefreshKey((pre) => pre + 1);
    }
  };

  const columns = useMemo<ColumnDef<IDocumentsData>[]>(
    () => [
      {
        accessorFn: (row: IDocumentsData) => row.created_at,
        id: 'created_at',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Date Uploaded"
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
                  {row.original.created_at ? format(row.original.created_at, 'd/m/y') : '--'}
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
        id: 'document_name',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Document Name"
            column={column}
            icon={<i className="ki-filled ki-user"></i>}
          />
        ),
        cell: (info) => {
          return (
            <div className="flex items-center text-gray-800 font-normal gap-1.5">
              {info.row.original.document_name}
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
        <h3 className="card-title font-medium text-sm">Documents</h3>

        {/* <div className="flex flex-wrap gap-2 lg:gap-5">
          <div className="flex">
            <label className="input input-sm">
              <KeenIcon icon="magnifier" />
              <input
                type="text"
                placeholder="search documents"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </label>
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

export { DocumentsTable };
