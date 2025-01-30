import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DataGrid, DataGridColumnHeader, KeenIcon } from '@/components';
import { ColumnDef } from '@tanstack/react-table';

import { MenuIcon, MenuLink, MenuSub, MenuTitle } from '@/components';
import { Menu, MenuItem, MenuToggle } from '@/components';
import { useLanguage } from '@/i18n';
import { OrganizationsData, IOrganizationsData } from './';

const DropdownCard2 = () => {
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
        <MenuLink path="/service-Request/edit-service/2341242314122">
          <MenuIcon>
            <KeenIcon icon="notepad-edit" />
          </MenuIcon>
          <MenuTitle>Edit</MenuTitle>
        </MenuLink>
      </MenuItem>
    </MenuSub>
  );
};

const OrganizationsTable = () => {
  const { isRTL } = useLanguage();

  const columns = useMemo<ColumnDef<IOrganizationsData>[]>(
    () => [
      {
        accessorFn: (row: IOrganizationsData) => row,
        id: 'users',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Service Request"
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
                  {row.original.service}
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
        id: 'click',
        header: () => '',
        enableSorting: false,
        cell: () => (
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
              {DropdownCard2()}
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

  const data: IOrganizationsData[] = useMemo(() => OrganizationsData, []);

  return (
    <DataGrid
      columns={columns}
      data={data}
      rowSelection={true}
      pagination={{ size: 5 }}
      sorting={[{ id: 'users', desc: false }]}
      layout={{ card: false }}
    />
  );
};

export { OrganizationsTable };
