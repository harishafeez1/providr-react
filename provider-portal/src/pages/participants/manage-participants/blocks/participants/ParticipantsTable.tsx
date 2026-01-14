import { useMemo, useState } from 'react';
import {
  DataGrid,
  DataGridColumnHeader,
  KeenIcon,
  Menu,
  MenuItem,
  MenuToggle,
  TDataGridRequestParams
} from '@/components';
import { ColumnDef } from '@tanstack/react-table';
import { MenuIcon, MenuLink, MenuSub, MenuTitle } from '@/components';
import { useNavigate } from 'react-router-dom';

import { IParticipantsData } from './';
import { ParticipantDetailsModal } from './ParticipantDetailsModal';
import { useLanguage } from '@/i18n';
import { useAuthContext } from '@/auth';
import { deleteParticipant, getAllParticipants } from '@/services/api';
import { ModalDeleteConfirmation } from '@/partials/modals/delete-confirmation';

const DropdownCard2 = (
  participantId: string | number,
  handleModalOpen: (id: string | number) => void
) => {
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
              options: { offset: isRTL() ? [15, 0] : [-15, 0] }
            }
          ]
        }}
      >
        <MenuLink path={`/participants/edit-participant/${participantId}`}>
          <MenuIcon>
            <KeenIcon icon="notepad-edit" />
          </MenuIcon>
          <MenuTitle>Edit</MenuTitle>
        </MenuLink>
      </MenuItem>

      <MenuItem
        onClick={() => handleModalOpen(participantId)}
        toggle="dropdown"
      >
        <MenuLink>
          <span className="flex">
            <MenuIcon>
              <KeenIcon icon="trash" />
            </MenuIcon>
            <MenuTitle>Delete</MenuTitle>
          </span>
        </MenuLink>
      </MenuItem>
    </MenuSub>
  );
};

const ParticipantsTable = () => {
  const { currentUser } = useAuthContext();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<IParticipantsData | null>(null);

  const handleModalClose = () => setIsModalOpen(false);

  const handleModalOpen = (id: string | number) => {
    setSelectedId(String(id));
    setIsModalOpen(true);
  };

  const handleRowClick = (participant: IParticipantsData) => {
    setSelectedParticipant(participant);
    setShowDetailsModal(true);
  };

  const handleDetailsModalClose = () => {
    setShowDetailsModal(false);
    setSelectedParticipant(null);
  };

  const handleViewIncidents = (participantId: string | number, participantName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/incidents?participant_id=${participantId}&participant_name=${encodeURIComponent(participantName)}`);
  };

  const fetchAllParticipants = async (params: TDataGridRequestParams) => {
    if (!currentUser) {
      return { data: [], totalCount: 0 };
    }

    try {
      const queryParams = new URLSearchParams();
      queryParams.set('page', String(params.pageIndex + 1));
      queryParams.set('per_page', String(params.pageSize));

      if (params.sorting?.[0]) {
        queryParams.set('sort', params.sorting[0].id);
        queryParams.set('order', params.sorting[0].desc ? 'desc' : 'asc');
      }

      params.columnFilters?.forEach(({ id, value }) => {
        if (value !== undefined && value !== null) {
          queryParams.set(`filter[${id}]`, String(value));
        }
      });

      const response = await getAllParticipants(queryParams.toString());

      return {
        data: response.participants || [],
        totalCount: response.pagination?.total || 0
      };
    } catch {
      return { data: [], totalCount: 0 };
    }
  };

  const handleDeleteParticipant = async () => {
    try {
      await deleteParticipant(selectedId);
      setIsModalOpen(false);
      setRefreshKey((prev) => prev + 1);
      // Toast is shown automatically by axios interceptor
    } catch {
      // Error toast is shown automatically by axios interceptor
    }
  };

  const columns = useMemo<ColumnDef<IParticipantsData>[]>(
    () => [
      {
        accessorFn: (row) => `${row.first_name} ${row.last_name}`,
        id: 'name',
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Name"
            column={column}
            icon={<i className="ki-filled ki-user"></i>}
          />
        ),
        cell: ({ row }) => {
          const fullName = `${row.original.first_name || ''} ${row.original.last_name || ''}`.trim() || '';
          return (
            <div
              onClick={() => handleRowClick(row.original)}
              className="flex items-center text-gray-800 font-normal gap-1.5 cursor-pointer"
            >
              {fullName}
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[150px]'
        }
      },
      {
        accessorFn: (row) => row.dob,
        id: 'dob',
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Date of Birth"
            column={column}
            icon={<i className="ki-filled ki-calendar"></i>}
          />
        ),
        cell: ({ row }) => {
          const dob = row.original.dob
            ? new Date(row.original.dob).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            : 'N/A';
          return (
            <div
              onClick={() => handleRowClick(row.original)}
              className="text-sm text-gray-800 font-medium cursor-pointer"
            >
              {dob}
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[130px]'
        }
      },
      {
        accessorFn: (row) => row.gender,
        id: 'gender',
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Gender"
            column={column}
            icon={<i className="ki-filled ki-profile-circle"></i>}
          />
        ),
        cell: ({ row }) => {
          const gender = row.original.gender;
          let displayGender = '';

          if (gender === 'male') displayGender = 'Male';
          else if (gender === 'female') displayGender = 'Female';
          else if (gender === 'other') displayGender = 'Other';
          else if (gender === 'prefer_not_to_say') displayGender = 'Prefer Not To Say';
          else displayGender = '';

          return (
            <div
              onClick={() => handleRowClick(row.original)}
              className="flex items-center text-gray-800 font-normal gap-1.5 cursor-pointer"
            >
              {displayGender}
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[120px]'
        }
      },
      {
        accessorFn: (row) => row.assigned_practitioner,
        id: 'provider',
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Provider"
            column={column}
            icon={<i className="ki-filled ki-briefcase"></i>}
          />
        ),
        cell: ({ row }) => {
          const practitioner = row.original.assigned_practitioner;
          return (
            <div
              onClick={() => handleRowClick(row.original)}
              className="flex items-center text-gray-800 font-normal gap-1.5 cursor-pointer"
            >
              {practitioner
                ? `${practitioner.first_name} ${practitioner.last_name}`
                : 'N/A'}
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[140px]'
        }
      },
      {
        accessorFn: (row) => row.contact_email,
        id: 'contact',
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Contact"
            column={column}
            icon={<i className="ki-filled ki-phone"></i>}
          />
        ),
        cell: ({ row }) => (
          <div
            onClick={() => handleRowClick(row.original)}
            className="flex flex-col gap-0.5 cursor-pointer"
          >
            <div className="text-sm text-gray-800 font-normal">{row.original.contact_email || 'No email'}</div>
            <div className="text-xs text-gray-600">{row.original.contact_phone || 'No phone'}</div>
          </div>
        ),
        meta: {
          headerClassName: 'min-w-[160px]'
        }
      },
      {
        accessorFn: (row) => row.status,
        id: 'status',
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Status"
            column={column}
            icon={<i className="ki-filled ki-flag"></i>}
          />
        ),
        cell: ({ row }) => {
          const isActive = row.original.status === 'active';

          return (
            <span
              className={`badge ${isActive ? 'badge-success' : 'badge-danger'} badge-outline rounded-full cursor-pointer`}
              onClick={() => handleRowClick(row.original)}
            >
              {isActive ? 'Active' : 'Inactive'}
            </span>
          );
        },
        meta: {
          headerClassName: 'min-w-[110px]'
        }
      },
      {
        id: 'incidents',
        enableSorting: false,
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Incidents"
            column={column}
            icon={<i className="ki-filled ki-message-text"></i>}
          />
        ),
        cell: ({ row }) => {
          const fullName = `${row.original.first_name || ''} ${row.original.last_name || ''}`.trim();
          return (
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={(e) => handleViewIncidents(row.original.id, fullName, e)}
            >
              <KeenIcon icon="eye" className="text-sm mr-1" />
              View Incidents
            </button>
          );
        },
        meta: {
          headerClassName: 'min-w-[140px]'
        }
      },
      {
        id: 'actions',
        enableSorting: false,
        header: () => '',
        cell: ({ row }) => (
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
                      offset: isRTL() ? [0, -10] : [0, 10]
                    }
                  }
                ]
              }}
            >
              <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
                <KeenIcon icon="dots-vertical" />
              </MenuToggle>
              {DropdownCard2(row.original.id, handleModalOpen)}
            </MenuItem>
          </Menu>
        ),
        meta: {
          headerClassName: 'w-[60px]'
        }
      }
    ],
    [handleViewIncidents, handleRowClick, isRTL]
  );

  return (
    <>
      <DataGrid
        key={refreshKey}
        columns={columns}
        serverSide={true}
        onFetchData={fetchAllParticipants}
        rowSelection={false}
        pagination={{ size: 10 }}
        layout={{ card: true }}
      />

      <ModalDeleteConfirmation
        open={isModalOpen}
        onOpenChange={handleModalClose}
        onDeleteConfirm={handleDeleteParticipant}
      />

      <ParticipantDetailsModal
        showModal={showDetailsModal}
        onClose={handleDetailsModalClose}
        participant={selectedParticipant}
      />
    </>
  );
};

export { ParticipantsTable };
