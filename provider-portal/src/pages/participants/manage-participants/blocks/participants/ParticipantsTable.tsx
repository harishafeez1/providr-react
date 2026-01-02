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
import { ColumnDef, Column } from '@tanstack/react-table';
import { MenuIcon, MenuLink, MenuSub, MenuTitle } from '@/components';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

import { IParticipantsData } from './';
import { ParticipantDetailsModal } from './ParticipantDetailsModal';
import { useLanguage } from '@/i18n';
import { useAuthContext } from '@/auth';
import { deleteParticipant, getAllParticipants } from '@/services/api';
import { ModalDeleteConfirmation } from '@/partials/modals/delete-confirmation';

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

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


  const ColumnInputFilter = <TData, TValue>({
    column
  }: IColumnFilterProps<TData, TValue>) => (
    <Input
      placeholder="Filter..."
      value={(column.getFilterValue() as string) ?? ''}
      onChange={(event) => column.setFilterValue(event.target.value)}
      className="h-9 w-full max-w-40"
    />
  );

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
      toast.success('Participant deleted successfully');
    } catch {
      toast.error('Failed to delete participant');
    }
  };

  const columns = useMemo<ColumnDef<IParticipantsData>[]>(
    () => [
      {
        accessorFn: (row) => `${row.first_name} ${row.last_name}`,
        id: 'name',
        header: 'Name',
        cell: ({ row }) => {
          const fullName = `${row.original.first_name || ''} ${row.original.last_name || ''}`.trim() || '';
          return (
            <div
              onClick={() => handleRowClick(row.original)}
              style={{ cursor: 'pointer' }}
            >
              {fullName}
            </div>
          );
        }
      },
      {
        accessorFn: (row) => row.dob,
        id: 'dob',
        header: 'Date of Birth',
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
              style={{ cursor: 'pointer' }}
            >
              {dob}
            </div>
          );
        }
      },
      {
        accessorFn: (row) => row.gender,
        id: 'gender',
        header: 'Gender',
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
              style={{ cursor: 'pointer' }}
            >
              {displayGender}
            </div>
          );
        }
      },
      {
        accessorFn: (row) => row.assigned_practitioner,
        id: 'provider',
        header: 'Provider',
        cell: ({ row }) => {
          const practitioner = row.original.assigned_practitioner;
          return (
            <div
              onClick={() => handleRowClick(row.original)}
              style={{ cursor: 'pointer' }}
            >
              {practitioner
                ? `${practitioner.first_name} ${practitioner.last_name}`
                : 'N/A'}
            </div>
          );
        }
      },
      {
        accessorFn: (row) => row.contact_email,
        id: 'contact',
        header: 'Contact',
        cell: ({ row }) => (
          <div
            onClick={() => handleRowClick(row.original)}
            style={{ cursor: 'pointer' }}
          >
            <div>{row.original.contact_email || 'No email'}</div>
            <div className="text-sm text-gray-600">{row.original.contact_phone || 'No phone'}</div>
          </div>
        )
      },
      {
        accessorFn: (row) => row.status,
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const isActive = row.original.status === 'active';

          return (
            <div
              onClick={() => handleRowClick(row.original)}
              style={{ cursor: 'pointer' }}
            >
              <span
                className={`badge badge-sm ${
                  isActive ? 'badge-success' : 'badge-danger'
                }`}
              >
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          );
        }
      },
      {
        id: 'incidents',
        enableSorting: false,
        header: 'Incidents',
        cell: ({ row }) => {
          const fullName = `${row.original.first_name || ''} ${row.original.last_name || ''}`.trim();
          return (
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={(e) => handleViewIncidents(row.original.id, fullName, e)}
              style={{ cursor: 'pointer' }}
            >
              <KeenIcon icon="eye" className="text-sm mr-1" />
              View Incidents
            </button>
          );
        }
      },
      {
        id: 'actions',
        enableSorting: false,
        header: 'Actions',
        cell: ({ row }) => (
          <Menu>
            <MenuItem toggle="dropdown">
              <MenuToggle className="btn btn-sm btn-icon btn-light">
                <KeenIcon icon="dots-vertical" />
              </MenuToggle>
              {DropdownCard2(row.original.id, handleModalOpen)}
            </MenuItem>
          </Menu>
        )
      }
    ],
    [handleViewIncidents, handleRowClick]
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
