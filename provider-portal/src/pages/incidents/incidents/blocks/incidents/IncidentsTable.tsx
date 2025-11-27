import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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

import { IIncidentsData } from './';
import { useLanguage } from '@/i18n';
import { fetchAllIncidents, deleteIncident, fetchSingleIncident, fetchBspAnalysis } from '@/services/api';
import { ModalDeleteConfirmation } from '@/partials/modals/delete-confirmation';

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

const IncidentsTable = () => {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedIncidentDetails, setSelectedIncidentDetails] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [bspAnalysisData, setBspAnalysisData] = useState<any>(null);
  const [loadingBspAnalysis, setLoadingBspAnalysis] = useState(false);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalOpen = (id: number) => {
    setSelectedId(id);
    setIsModalOpen(true);
  };

  const handleViewDetails = async (incidentId: number) => {
    setShowReportModal(true);
    setLoadingReport(true);
    setLoadingBspAnalysis(true);

    try {
      // Fetch incident details
      const response = await fetchSingleIncident(incidentId);
      setSelectedIncidentDetails(response);
      setLoadingReport(false);

      // Fetch BSP analysis
      try {
        const bspResponse = await fetchBspAnalysis(incidentId);
        setBspAnalysisData(bspResponse);
      } catch (bspErr: any) {
        console.error('Error fetching BSP analysis:', bspErr);
        toast.error('BSP Analysis could not be loaded');
      } finally {
        setLoadingBspAnalysis(false);
      }
    } catch (err: any) {
      console.error('Error fetching incident details:', err);
      toast.error(err?.response?.data?.message || 'Failed to load incident details');
      setShowReportModal(false);
      setLoadingReport(false);
      setLoadingBspAnalysis(false);
    }
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setSelectedIncidentDetails(null);
    setBspAnalysisData(null);
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'minor':
        return 'badge-success';
      case 'moderate':
        return 'badge-warning';
      case 'serious':
        return 'badge-danger';
      case 'critical':
        return 'badge-danger';
      default:
        return 'badge-light';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'badge-light';
      case 'submitted':
        return 'badge-info';
      case 'under_review':
        return 'badge-warning';
      case 'completed':
        return 'badge-success';
      default:
        return 'badge-light';
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'Draft';
      case 'submitted':
        return 'Submitted';
      case 'under_review':
        return 'Under Review';
      case 'completed':
        return 'Completed';
      default:
        return status || 'Draft';
    }
  };

  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    return date.toLocaleString('en-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const DropdownCard = (incidentId: number, handleModalOpen: any, handleViewDetails: any) => {
    return (
      <MenuSub className="menu-default" rootClassName="w-full max-w-[200px]">
        <MenuItem
          onClick={() => handleViewDetails(incidentId)}
          toggle="dropdown"
          trigger="hover"
          dropdownProps={{
            placement: isRTL() ? 'left-start' : 'right-start',
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: isRTL() ? [15, 0] : [-15, 0]
                }
              }
            ]
          }}
        >
          <MenuLink>
            <a className="flex">
              <MenuIcon>
                <KeenIcon icon="eye" />
              </MenuIcon>
              <MenuTitle>View Details</MenuTitle>
            </a>
          </MenuLink>
        </MenuItem>

        <MenuItem
          toggle="dropdown"
          trigger="hover"
          dropdownProps={{
            placement: isRTL() ? 'left-start' : 'right-start',
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: isRTL() ? [15, 0] : [-15, 0]
                }
              }
            ]
          }}
        >
          <MenuLink path={`/incidents/${incidentId}/edit`}>
            <MenuIcon>
              <KeenIcon icon="notepad-edit" />
            </MenuIcon>
            <MenuTitle>Edit</MenuTitle>
          </MenuLink>
        </MenuItem>

        <MenuItem
          onClick={() => handleModalOpen(incidentId)}
          toggle="dropdown"
          dropdownProps={{
            placement: isRTL() ? 'left-start' : 'right-start',
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: isRTL() ? [15, 0] : [-15, 0]
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

  const fetchIncidentsData = async (params: TDataGridRequestParams) => {
    try {
      console.log('Fetching incidents data...', params);
      const data = await fetchAllIncidents();
      console.log('Incidents API response:', data);

      // Handle different possible response formats
      let incidentsData = [];
      if (Array.isArray(data)) {
        incidentsData = data;
      } else if (data?.data?.incidents) {
        incidentsData = data.data.incidents;
      } else if (data?.incidents) {
        incidentsData = data.incidents;
      } else if (data?.data && Array.isArray(data.data)) {
        incidentsData = data.data;
      }

      console.log('Processed incidents data:', incidentsData);

      // Apply client-side filtering first
      let filteredData = incidentsData;
      if (params.columnFilters && params.columnFilters.length > 0) {
        filteredData = incidentsData.filter((item: any) => {
          return params.columnFilters!.every(({ id, value }) => {
            if (!value) return true;
            const itemValue = String(item[id] || '').toLowerCase();
            return itemValue.includes(String(value).toLowerCase());
          });
        });
      }

      // Apply client-side sorting
      if (params.sorting?.[0]?.id) {
        const sortField = params.sorting[0].id;
        const sortOrder = params.sorting[0].desc ? -1 : 1;
        filteredData.sort((a: any, b: any) => {
          const aVal = a[sortField];
          const bVal = b[sortField];
          if (aVal < bVal) return -1 * sortOrder;
          if (aVal > bVal) return 1 * sortOrder;
          return 0;
        });
      }

      // Apply client-side pagination
      const startIndex = params.pageIndex * params.pageSize;
      const endIndex = startIndex + params.pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      console.log('Returning paginated data:', paginatedData);

      return {
        data: paginatedData,
        totalCount: filteredData.length
      };
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast.error('Failed to load incidents. Please try again.');
      return {
        data: [],
        totalCount: 0
      };
    }
  };

  const columns = useMemo<ColumnDef<IIncidentsData>[]>(
    () => [
      {
        accessorFn: (row: IIncidentsData) => row.incident_number,
        id: 'incident_number',
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Incident Number"
            filter={<ColumnInputFilter column={column} />}
            column={column}
            icon={<i className="ki-filled ki-barcode"></i>}
          />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <div className="text-2sm text-gray-800 font-normal">{row.original.incident_number}</div>
              </div>
            </div>
          );
        },
        meta: {
          className: 'min-w-[150px]',
          cellClassName: 'text-gray-800 font-normal'
        }
      },
      {
        accessorFn: (row) => row.incident_date_time,
        id: 'incident_date_time',
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Date & Time"
            column={column}
            icon={<i className="ki-filled ki-calendar"></i>}
          />
        ),
        cell: (info) => {
          return (
            <div className="flex items-center text-gray-800 font-normal gap-1.5">
              {formatDateTime(info.row.original.incident_date_time)}
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[180px]'
        }
      },
      {
        accessorFn: (row) => row.severity,
        id: 'severity',
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Severity"
            column={column}
            icon={<i className="ki-filled ki-chart"></i>}
          />
        ),
        cell: (info) => {
          return (
            <span className={`badge ${getSeverityBadgeClass(info.row.original.severity)} badge-outline rounded-full`}>
              {info.row.original.severity || 'N/A'}
            </span>
          );
        },
        meta: {
          headerClassName: 'min-w-[100px]'
        }
      },
      {
        accessorFn: (row) => row.participant_name,
        id: 'participant_name',
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Participant"
            column={column}
            icon={<i className="ki-filled ki-user"></i>}
          />
        ),
        cell: (info) => {
          const participant = info.row.original.participant_name ||
            (info.row.original.customer
              ? `${info.row.original.customer.first_name || ''} ${info.row.original.customer.last_name || ''}`.trim()
              : 'N/A');
          return (
            <div className="flex items-center text-gray-800 font-normal gap-1.5">
              {participant}
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[150px]'
        }
      },
      {
        accessorFn: (row) => row.incident_type,
        id: 'incident_type',
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Type"
            column={column}
            icon={<i className="ki-filled ki-category"></i>}
          />
        ),
        cell: (info) => {
          return (
            <div className="flex items-center text-gray-800 font-normal gap-1.5">
              {info.row.original.incident_type || 'N/A'}
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[150px]'
        }
      },
      {
        accessorFn: (row) => row.injury_occurred,
        id: 'injury_occurred',
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Injury"
            column={column}
            icon={<i className="ki-filled ki-heart-pulse"></i>}
          />
        ),
        cell: (info) => {
          return (
            <div className="flex justify-center">
              {info.row.original.injury_occurred ? (
                <span className="badge badge-danger badge-outline rounded-full badge-sm">Yes</span>
              ) : (
                <span className="badge badge-success badge-outline rounded-full badge-sm">No</span>
              )}
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[80px]'
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
        cell: (info) => {
          return (
            <span className={`badge ${getStatusBadgeClass(info.row.original.status)} badge-outline rounded-full`}>
              {getStatusDisplayName(info.row.original.status)}
            </span>
          );
        },
        meta: {
          headerClassName: 'min-w-[100px]'
        }
      },
      {
        id: 'actions',
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
                      offset: isRTL() ? [0, -10] : [0, 10]
                    }
                  }
                ]
              }}
            >
              <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
                <KeenIcon icon="dots-vertical" />
              </MenuToggle>
              {DropdownCard(row.row.original.id, handleModalOpen, handleViewDetails)}
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

  const handleDeleteIncident = async () => {
    if (selectedId) {
      await deleteIncident(selectedId);
      toast.success('Incident deleted successfully');
    }
  };

  const Toolbar = () => {
    return (
      <div className="card-header flex-wrap px-5 py-5 border-b-0">
        <h3 className="card-title">Incidents</h3>
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
        onFetchData={fetchIncidentsData}
        onRowSelectionChange={handleRowSelection}
        pagination={{ size: 10 }}
        layout={{ card: true }}
        toolbar={<Toolbar />}
      />
      <ModalDeleteConfirmation
        open={isModalOpen}
        onOpenChange={handleModalClose}
        onDeleteConfirm={async () => {
          await handleDeleteIncident();
          setRefreshKey((prev) => prev + 1);
          handleModalClose();
        }}
      />

      {/* Report Modal */}
      {showReportModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflowY: 'auto'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeReportModal();
            }
          }}
        >
          <style>
            {`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
              }
              @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
              }
            `}
          </style>
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              maxWidth: '1200px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Modal Header */}
              <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="modal-title" style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                  <i className="ki-outline ki-document text-xl mr-2"></i>
                  Incident Report
                </h3>
                <button
                  type="button"
                  className="btn btn-sm btn-icon btn-light"
                  onClick={closeReportModal}
                  style={{ cursor: 'pointer' }}
                >
                  <i className="ki-outline ki-cross text-base"></i>
                </button>
              </div>

              {/* Modal Body */}
              <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                {loadingReport ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px',
                    padding: '40px 20px'
                  }}>
                    <div style={{
                      position: 'relative',
                      width: '120px',
                      height: '120px',
                      marginBottom: '32px'
                    }}>
                      {/* Outer rotating ring */}
                      <div style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        border: '4px solid #e5e7eb',
                        borderTop: '4px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      {/* Middle rotating ring */}
                      <div style={{
                        position: 'absolute',
                        width: '80%',
                        height: '80%',
                        top: '10%',
                        left: '10%',
                        border: '4px solid #e5e7eb',
                        borderBottom: '4px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1.5s linear infinite reverse'
                      }}></div>
                      {/* Center icon */}
                      <div style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <i className="ki-outline ki-document text-4xl text-primary" style={{
                          animation: 'pulse 2s ease-in-out infinite'
                        }}></i>
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <h4 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#111827',
                        marginBottom: '8px'
                      }}>
                        Loading Incident Report
                      </h4>
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        marginBottom: '16px'
                      }}>
                        Fetching incident details and AI-generated reports...
                      </p>

                      {/* Progress dots */}
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#3b82f6',
                          animation: 'bounce 1.4s ease-in-out infinite'
                        }}></div>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#3b82f6',
                          animation: 'bounce 1.4s ease-in-out 0.2s infinite'
                        }}></div>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#3b82f6',
                          animation: 'bounce 1.4s ease-in-out 0.4s infinite'
                        }}></div>
                      </div>
                    </div>
                  </div>
                ) : selectedIncidentDetails ? (
                  <div className="space-y-6">
                    {/* BSP ANALYSIS SECTION */}
                    {loadingBspAnalysis ? (
                      <div className="card bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
                        <div className="card-body">
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '200px',
                            padding: '40px 20px'
                          }}>
                            <div style={{
                              position: 'relative',
                              width: '80px',
                              height: '80px',
                              marginBottom: '24px'
                            }}>
                              <div style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                border: '4px solid #e9d5ff',
                                borderTop: '4px solid #9333ea',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                              }}></div>
                              <div style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <i className="ki-outline ki-shield-tick text-3xl" style={{ color: '#9333ea' }}></i>
                              </div>
                            </div>
                            <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#581c87', marginBottom: '8px' }}>
                              Generating AI-Powered BSP Analysis
                            </h4>
                            <p style={{ fontSize: '0.875rem', color: '#7c3aed', marginBottom: '16px' }}>
                              Analyzing incident against Behavior Support Plan...
                            </p>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#9333ea', animation: 'bounce 1.4s ease-in-out infinite' }}></div>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#9333ea', animation: 'bounce 1.4s ease-in-out 0.2s infinite' }}></div>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#9333ea', animation: 'bounce 1.4s ease-in-out 0.4s infinite' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : bspAnalysisData?.bsp_analysis ? (
                      <div className="space-y-4">
                        {/* BSP Analysis Header */}
                        {/* Section 1: BSP Gaps Detected */}
                        {bspAnalysisData.bsp_analysis?.gaps_detected?.count > 0 && (
                          <div className="card bg-red-50 border-2 border-red-200">
                            <div className="card-body">
                              <h4 className="text-lg font-bold text-red-900 mb-4 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                  <i className="ki-filled ki-information-2 text-xl text-red-600"></i>
                                  {bspAnalysisData.bsp_analysis.gaps_detected.title}
                                </span>
                                <span className="badge badge-danger badge-lg">{bspAnalysisData.bsp_analysis.gaps_detected.count} Gaps</span>
                              </h4>
                              <div className="space-y-2">
                                {(bspAnalysisData.bsp_analysis.gaps_detected.data || []).map((gap: any, idx: number) => (
                                  <div key={idx} className="bg-white p-3 rounded-lg border-l-4 border-red-400">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="badge badge-sm badge-danger">{gap.type || 'gap'}</span>
                                    </div>
                                    <p className="text-sm text-red-900">{gap.description || gap}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="card bg-gradient-to-r from-amber-50 to-amber-200 border-0">
                          <div className="card-body p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-2xl font-bold text-amber-900 mb-2 flex items-center gap-3">
                                  <i className="ki-filled ki-shield-tick text-3xl"></i>
                                  AI-Powered BSP Analysis
                                </h3>
                                <p className="text-amber-900 text-sm">
                                  Comprehensive behavior support plan alignment and risk assessment
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        

                        {/* Section 2: Draft BSP Update */}
                        {bspAnalysisData.bsp_analysis.draft_update?.data && (
                          <div className="card bg-blue-50 border-2 border-blue-200">
                            <div className="card-body">
                              <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                                <i className="ki-filled ki-document text-xl text-blue-600"></i>
                                {bspAnalysisData.bsp_analysis.draft_update.title}
                              </h4>
                              <div className="space-y-4">
                                {bspAnalysisData.bsp_analysis.draft_update.data.context_of_behaviour && (
                                  <div>
                                    <p className="text-sm font-semibold text-blue-700 mb-2">Context of Behaviour</p>
                                    <p className="text-sm text-blue-900 bg-white p-3 rounded-lg">{bspAnalysisData.bsp_analysis.draft_update.data.context_of_behaviour}</p>
                                  </div>
                                )}
                                {bspAnalysisData.bsp_analysis.draft_update.data.environmental_considerations && (
                                  <div>
                                    <p className="text-sm font-semibold text-blue-700 mb-2">Environmental Considerations</p>
                                    <p className="text-sm text-blue-900 bg-white p-3 rounded-lg">{bspAnalysisData.bsp_analysis.draft_update.data.environmental_considerations}</p>
                                  </div>
                                )}
                                {bspAnalysisData.bsp_analysis.draft_update.data.trauma_informed_adjustments && (
                                  <div>
                                    <p className="text-sm font-semibold text-blue-700 mb-2">Trauma-Informed Adjustments</p>
                                    <p className="text-sm text-blue-900 bg-white p-3 rounded-lg">{bspAnalysisData.bsp_analysis.draft_update.data.trauma_informed_adjustments}</p>
                                  </div>
                                )}
                                {bspAnalysisData.bsp_analysis.draft_update.data.safety_recommendations && (
                                  <div>
                                    <p className="text-sm font-semibold text-blue-700 mb-2">Safety Recommendations</p>
                                    <p className="text-sm text-blue-900 bg-white p-3 rounded-lg">{bspAnalysisData.bsp_analysis.draft_update.data.safety_recommendations}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Section 3: Trigger Alignment */}
                        {bspAnalysisData.bsp_analysis.trigger_alignment?.data && (
                          <div className="card bg-amber-50 border-2 border-amber-200">
                            <div className="card-body">
                              <h4 className="text-lg font-bold text-amber-900 mb-4 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                  <i className="ki-filled ki-chart-line text-xl text-amber-600"></i>
                                  {bspAnalysisData.bsp_analysis.trigger_alignment.title}
                                </span>
                                <span className={`badge badge-lg ${
                                  bspAnalysisData.bsp_analysis.trigger_alignment.data.confidence_level === 'high' ? 'badge-success' :
                                  bspAnalysisData.bsp_analysis.trigger_alignment.data.confidence_level === 'medium' ? 'badge-warning' : 'badge-light'
                                }`}>
                                  {bspAnalysisData.bsp_analysis.trigger_alignment.data.confidence_level || 'N/A'} Confidence
                                </span>
                              </h4>
                              <div className="space-y-3">
                                {bspAnalysisData.bsp_analysis.trigger_alignment.data.alignment_explanation && (
                                  <p className="text-sm text-amber-900 bg-white p-3 rounded-lg">{bspAnalysisData.bsp_analysis.trigger_alignment.data.alignment_explanation}</p>
                                )}
                                {bspAnalysisData.bsp_analysis.trigger_alignment.data.matched_triggers?.length > 0 && (
                                  <div>
                                    <p className="text-sm font-semibold text-amber-700 mb-2">Matched Triggers</p>
                                    <div className="space-y-2">
                                      {(bspAnalysisData.bsp_analysis.trigger_alignment.data.matched_triggers || []).map((trigger: string, idx: number) => (
                                        <div key={idx} className="bg-white p-2 rounded border-l-4 border-amber-400">
                                          <p className="text-sm text-amber-900">{trigger}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Section 4: Strategy Assessment */}
                        {bspAnalysisData.bsp_analysis.strategy_assessment?.data && (
                          <div className="card bg-purple-50 border-2 border-purple-200">
                            <div className="card-body">
                              <h4 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                                <i className="ki-filled ki-abstract-26 text-xl text-purple-600"></i>
                                {bspAnalysisData.bsp_analysis.strategy_assessment.title}
                              </h4>
                              <div className="space-y-4">
                                {bspAnalysisData.bsp_analysis.strategy_assessment.data.staff_response_evaluation && (
                                  <div>
                                    <p className="text-sm font-semibold text-purple-700 mb-2">Staff Response Evaluation</p>
                                    <p className="text-sm text-purple-900 bg-white p-3 rounded-lg">{bspAnalysisData.bsp_analysis.strategy_assessment.data.staff_response_evaluation}</p>
                                  </div>
                                )}
                                {bspAnalysisData.bsp_analysis.strategy_assessment.data.missing_proactive_strategies?.length > 0 && (
                                  <div>
                                    <p className="text-sm font-semibold text-purple-700 mb-2">Missing Proactive Strategies</p>
                                    {(bspAnalysisData.bsp_analysis.strategy_assessment.data.missing_proactive_strategies || []).map((strategy: string, idx: number) => (
                                      <div key={idx} className="bg-white p-2 rounded mb-2 border-l-4 border-purple-400">
                                        <p className="text-sm text-purple-900">{strategy}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {bspAnalysisData.bsp_analysis.strategy_assessment.data.missed_reactive_strategies?.length > 0 && (
                                  <div>
                                    <p className="text-sm font-semibold text-purple-700 mb-2">Missed Reactive Strategies</p>
                                    {(bspAnalysisData.bsp_analysis.strategy_assessment.data.missed_reactive_strategies || []).map((strategy: string, idx: number) => (
                                      <div key={idx} className="bg-white p-2 rounded mb-2 border-l-4 border-purple-400">
                                        <p className="text-sm text-purple-900">{strategy}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Section 5: Identified Gaps Summary */}
                        {bspAnalysisData.bsp_analysis?.gaps_summary?.count > 0 && (
                          <div className="card bg-orange-50 border-2 border-orange-200">
                            <div className="card-body">
                              <h4 className="text-lg font-bold text-orange-900 mb-4 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                  <i className="ki-filled ki-warning-2 text-xl text-orange-600"></i>
                                  {bspAnalysisData.bsp_analysis.gaps_summary.title}
                                </span>
                                <span className="badge badge-warning badge-lg">{bspAnalysisData.bsp_analysis.gaps_summary.count} Issues</span>
                              </h4>
                              <div className="space-y-2">
                                {(bspAnalysisData.bsp_analysis.gaps_summary.data || []).map((gap: any, idx: number) => (
                                  <div key={idx} className="bg-white p-3 rounded-lg border-l-4 border-orange-400">
                                    <p className="text-sm text-orange-900">{typeof gap === 'string' ? gap : gap.description || gap.gap || JSON.stringify(gap)}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Section 6: BSP Internal Inconsistencies */}
                        {bspAnalysisData.bsp_analysis?.inconsistencies?.count > 0 && (
                          <div className="card bg-pink-50 border-2 border-pink-200">
                            <div className="card-body">
                              <h4 className="text-lg font-bold text-pink-900 mb-4 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                  <i className="ki-filled ki-cross-circle text-xl text-pink-600"></i>
                                  {bspAnalysisData.bsp_analysis.inconsistencies.title}
                                </span>
                                <span className="badge badge-danger badge-lg">{bspAnalysisData.bsp_analysis.inconsistencies.count} Found</span>
                              </h4>
                              <div className="space-y-2">
                                {(bspAnalysisData.bsp_analysis.inconsistencies.data || []).map((inconsistency: any, idx: number) => (
                                  <div key={idx} className="bg-white p-3 rounded-lg border-l-4 border-pink-400">
                                    <p className="text-sm text-pink-900">{typeof inconsistency === 'string' ? inconsistency : inconsistency.description || inconsistency.inconsistency || JSON.stringify(inconsistency)}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Section 7: Potentially Outdated Strategies */}
                        {bspAnalysisData.bsp_analysis?.outdated_strategies?.count > 0 && (
                          <div className="card bg-slate-50 border-2 border-slate-200">
                            <div className="card-body">
                              <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                  <i className="ki-filled ki-timer text-xl text-slate-600"></i>
                                  {bspAnalysisData.bsp_analysis.outdated_strategies.title}
                                </span>
                                <span className="badge badge-light badge-lg">{bspAnalysisData.bsp_analysis.outdated_strategies.count} Strategies</span>
                              </h4>
                              <div className="space-y-3">
                                {(bspAnalysisData.bsp_analysis.outdated_strategies.data || []).map((item: any, idx: number) => (
                                  <div key={idx} className="bg-white p-4 rounded-lg border-l-4 border-slate-400">
                                    <p className="text-sm font-semibold text-slate-900 mb-2">{item.strategy || item}</p>
                                    {item.reason && (
                                      <p className="text-xs text-slate-700 mb-2"><strong>Reason:</strong> {item.reason}</p>
                                    )}
                                    {item.suggested_update && (
                                      <p className="text-xs text-slate-600"><strong>Suggested Update:</strong> {item.suggested_update}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Section 8: Skill Building Opportunities */}
                        {bspAnalysisData.bsp_analysis?.skill_building?.count > 0 && (
                          <div className="card bg-teal-50 border-2 border-teal-200">
                            <div className="card-body">
                              <h4 className="text-lg font-bold text-teal-900 mb-4 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                  <i className="ki-filled ki-rocket text-xl text-teal-600"></i>
                                  {bspAnalysisData.bsp_analysis.skill_building.title}
                                </span>
                                <span className="badge badge-info badge-lg">{bspAnalysisData.bsp_analysis.skill_building.count} Opportunities</span>
                              </h4>
                              <div className="space-y-3">
                                {(bspAnalysisData.bsp_analysis.skill_building.data || []).map((item: any, idx: number) => (
                                  <div key={idx} className="bg-white p-4 rounded-lg border-l-4 border-teal-400">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="badge badge-sm badge-info">{item.skill_area || 'Skill'}</span>
                                    </div>
                                    {item.recommendation && (
                                      <p className="text-sm text-teal-900 mb-2"><strong>Recommendation:</strong> {item.recommendation}</p>
                                    )}
                                    {item.functional_basis && (
                                      <p className="text-xs text-teal-700"><strong>Functional Basis:</strong> {item.functional_basis}</p>
                                    )}
                                    {!item.recommendation && !item.functional_basis && (
                                      <p className="text-sm text-teal-900">{item}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Section 9: Risk Insights */}
                        {bspAnalysisData.bsp_analysis.risk_insights?.data && (
                          <div className="card bg-rose-50 border-2 border-rose-200">
                            <div className="card-body">
                              <h4 className="text-lg font-bold text-rose-900 mb-4 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                  <i className="ki-filled ki-shield-cross text-xl text-rose-600"></i>
                                  {bspAnalysisData.bsp_analysis.risk_insights.title}
                                </span>
                                <span className={`badge badge-lg ${
                                  bspAnalysisData.bsp_analysis.risk_insights.data.recurrence_risk === 'high' ? 'badge-danger' :
                                  bspAnalysisData.bsp_analysis.risk_insights.data.recurrence_risk === 'medium' ? 'badge-warning' : 'badge-success'
                                }`}>
                                  {bspAnalysisData.bsp_analysis.risk_insights.data.recurrence_risk || 'N/A'} Risk
                                </span>
                              </h4>
                              <div className="space-y-4">
                                {bspAnalysisData.bsp_analysis.risk_insights.data.risk_mitigation_summary && (
                                  <div>
                                    <p className="text-sm font-semibold text-rose-700 mb-2">Risk Mitigation Summary</p>
                                    <p className="text-sm text-rose-900 bg-white p-3 rounded-lg">{bspAnalysisData.bsp_analysis.risk_insights.data.risk_mitigation_summary}</p>
                                  </div>
                                )}
                                {bspAnalysisData.bsp_analysis.risk_insights.data.environmental_risk_factors?.length > 0 && (
                                  <div>
                                    <p className="text-sm font-semibold text-rose-700 mb-2">Environmental Risk Factors</p>
                                    {(bspAnalysisData.bsp_analysis.risk_insights.data.environmental_risk_factors || []).map((factor: string, idx: number) => (
                                      <div key={idx} className="bg-white p-2 rounded mb-2 border-l-4 border-rose-400">
                                        <p className="text-sm text-rose-900">{factor}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {bspAnalysisData.bsp_analysis.risk_insights.data.behavioural_risk_factors?.length > 0 && (
                                  <div>
                                    <p className="text-sm font-semibold text-rose-700 mb-2">Behavioural Risk Factors</p>
                                    {(bspAnalysisData.bsp_analysis.risk_insights.data.behavioural_risk_factors || []).map((factor: string, idx: number) => (
                                      <div key={idx} className="bg-white p-2 rounded mb-2 border-l-4 border-rose-400">
                                        <p className="text-sm text-rose-900">{factor}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Section 10: NDIS Compliance Assessment */}
                        {bspAnalysisData.bsp_analysis.compliance?.data && (
                          <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300">
                            <div className="card-body">
                              <h4 className="text-lg font-bold text-green-900 mb-4 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                  <i className="ki-filled ki-verify text-xl text-green-600"></i>
                                  {bspAnalysisData.bsp_analysis.compliance.title}
                                </span>
                                <span className={`badge badge-lg ${
                                  bspAnalysisData.bsp_analysis.compliance.data.compliance_level === 'compliant' ? 'badge-success' :
                                  bspAnalysisData.bsp_analysis.compliance.data.compliance_level === 'partial' ? 'badge-warning' : 'badge-danger'
                                }`}>
                                  {bspAnalysisData.bsp_analysis.compliance.data.compliance_level || 'N/A'}
                                </span>
                              </h4>
                              <div className="grid md:grid-cols-2 gap-4">
                                {bspAnalysisData.bsp_analysis.compliance.data.person_centred_practice && (
                                  <div className="bg-white p-3 rounded-lg">
                                    <p className="text-xs font-semibold text-green-700 mb-1">Person-Centred Practice</p>
                                    <div className="flex items-center justify-between">
                                      <span className={`badge ${bspAnalysisData.bsp_analysis.compliance.data.person_centred_practice.status === 'compliant' ? 'badge-success' : 'badge-danger'}`}>
                                        {bspAnalysisData.bsp_analysis.compliance.data.person_centred_practice.status}
                                      </span>
                                    </div>
                                    {bspAnalysisData.bsp_analysis.compliance.data.person_centred_practice.notes && (
                                      <p className="text-xs text-green-900 mt-2">{bspAnalysisData.bsp_analysis.compliance.data.person_centred_practice.notes}</p>
                                    )}
                                  </div>
                                )}
                                {bspAnalysisData.bsp_analysis.compliance.data.positive_behaviour_support_framework && (
                                  <div className="bg-white p-3 rounded-lg">
                                    <p className="text-xs font-semibold text-green-700 mb-1">PBS Framework</p>
                                    <div className="flex items-center justify-between">
                                      <span className={`badge ${bspAnalysisData.bsp_analysis.compliance.data.positive_behaviour_support_framework.status === 'compliant' ? 'badge-success' : 'badge-danger'}`}>
                                        {bspAnalysisData.bsp_analysis.compliance.data.positive_behaviour_support_framework.status}
                                      </span>
                                    </div>
                                    {bspAnalysisData.bsp_analysis.compliance.data.positive_behaviour_support_framework.notes && (
                                      <p className="text-xs text-green-900 mt-2">{bspAnalysisData.bsp_analysis.compliance.data.positive_behaviour_support_framework.notes}</p>
                                    )}
                                  </div>
                                )}
                                {bspAnalysisData.bsp_analysis.compliance.data.restrictive_practice_documentation && (
                                  <div className="bg-white p-3 rounded-lg">
                                    <p className="text-xs font-semibold text-green-700 mb-1">Restrictive Practice Documentation</p>
                                    <div className="flex items-center justify-between">
                                      <span className={`badge ${bspAnalysisData.bsp_analysis.compliance.data.restrictive_practice_documentation.status === 'compliant' ? 'badge-success' : 'badge-danger'}`}>
                                        {bspAnalysisData.bsp_analysis.compliance.data.restrictive_practice_documentation.status}
                                      </span>
                                    </div>
                                    {bspAnalysisData.bsp_analysis.compliance.data.restrictive_practice_documentation.notes && (
                                      <p className="text-xs text-green-900 mt-2">{bspAnalysisData.bsp_analysis.compliance.data.restrictive_practice_documentation.notes}</p>
                                    )}
                                  </div>
                                )}
                                {bspAnalysisData.bsp_analysis.compliance.data.environment_safety_obligations && (
                                  <div className="bg-white p-3 rounded-lg">
                                    <p className="text-xs font-semibold text-green-700 mb-1">Environment Safety</p>
                                    <div className="flex items-center justify-between">
                                      <span className={`badge ${bspAnalysisData.bsp_analysis.compliance.data.environment_safety_obligations.status === 'compliant' ? 'badge-success' : 'badge-danger'}`}>
                                        {bspAnalysisData.bsp_analysis.compliance.data.environment_safety_obligations.status}
                                      </span>
                                    </div>
                                    {bspAnalysisData.bsp_analysis.compliance.data.environment_safety_obligations.notes && (
                                      <p className="text-xs text-green-900 mt-2">{bspAnalysisData.bsp_analysis.compliance.data.environment_safety_obligations.notes}</p>
                                    )}
                                  </div>
                                )}
                                {bspAnalysisData.bsp_analysis.compliance.data.incident_documentation_standards && (
                                  <div className="bg-white p-3 rounded-lg">
                                    <p className="text-xs font-semibold text-green-700 mb-1">Incident Documentation</p>
                                    <div className="flex items-center justify-between">
                                      <span className={`badge ${bspAnalysisData.bsp_analysis.compliance.data.incident_documentation_standards.status === 'compliant' ? 'badge-success' : 'badge-danger'}`}>
                                        {bspAnalysisData.bsp_analysis.compliance.data.incident_documentation_standards.status}
                                      </span>
                                    </div>
                                    {bspAnalysisData.bsp_analysis.compliance.data.incident_documentation_standards.notes && (
                                      <p className="text-xs text-green-900 mt-2">{bspAnalysisData.bsp_analysis.compliance.data.incident_documentation_standards.notes}</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}

                    {/* SEPARATOR */}
                    {bspAnalysisData?.bsp_analysis && (
                      <div className="border-t-4 border-gray-300 my-6"></div>
                    )}

                    {/* Header Section */}
                    <div className="bg-primary-light/10 border-l-4 border-primary p-6 rounded-lg">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Incident Number</p>
                          <p className="text-lg font-bold text-gray-900">{selectedIncidentDetails.incident_number}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                          <p className="text-lg font-semibold text-gray-900">{formatDateTime(selectedIncidentDetails.incident_date_time)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Severity</p>
                          <span className={`badge badge-lg ${getSeverityBadgeClass(selectedIncidentDetails.severity)}`}>
                            {selectedIncidentDetails.severity}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Status</p>
                          <span className={`badge badge-lg ${getStatusBadgeClass(selectedIncidentDetails.status)}`}>
                            {selectedIncidentDetails.status || 'Draft'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Basic Information */}
                    <div className="card bg-gray-50">
                      <div className="card-body">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <i className="ki-outline ki-information-2 text-xl mr-2 text-primary"></i>
                          Basic Information
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-600 mb-1">Participant Name</p>
                            <p className="text-base text-gray-900">{selectedIncidentDetails.participant_name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-600 mb-1">Location</p>
                            <p className="text-base text-gray-900">{selectedIncidentDetails.location || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-600 mb-1">Incident Type</p>
                            <p className="text-base text-gray-900">{selectedIncidentDetails.incident_type || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-600 mb-1">Injury Occurred</p>
                            <p className="text-base text-gray-900">
                              {selectedIncidentDetails.injury_occurred ? (
                                <span className="text-danger font-semibold">Yes</span>
                              ) : (
                                <span className="text-success font-semibold">No</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm font-semibold text-gray-600 mb-2">Description</p>
                          <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                            {selectedIncidentDetails.description || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* NDIS Details */}
                    {selectedIncidentDetails.what_happened && (
                      <div className="card bg-gray-50">
                        <div className="card-body">
                          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <i className="ki-outline ki-shield-tick text-xl mr-2 text-primary"></i>
                            NDIS Detailed Report
                          </h4>

                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-semibold text-gray-600 mb-2">What Happened</p>
                              <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                                {selectedIncidentDetails.what_happened}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-gray-600 mb-2">Lead-up & Triggers</p>
                              <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                                {selectedIncidentDetails.lead_up_triggers || 'N/A'}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-gray-600 mb-2">During the Incident</p>
                              <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                                {selectedIncidentDetails.during_incident || 'N/A'}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-gray-600 mb-2">Staff Response & Actions</p>
                              <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                                {selectedIncidentDetails.response_actions || 'N/A'}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-gray-600 mb-2">Causes & Contributing Factors</p>
                              <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                                {selectedIncidentDetails.causes_contributing_factors || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Medical Information */}
                    {selectedIncidentDetails.injury_occurred && (
                      <div className="card bg-gray-50">
                        <div className="card-body">
                          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <i className="ki-outline ki-pulse text-xl mr-2 text-danger"></i>
                            Medical Information
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-semibold text-gray-600 mb-1">Medical Treatment Required</p>
                              <p className="text-base text-gray-900">
                                {selectedIncidentDetails.medical_treatment_required ? 'Yes' : 'No'}
                              </p>
                            </div>
                          </div>
                          {selectedIncidentDetails.injury_details && (
                            <div className="mt-4">
                              <p className="text-sm font-semibold text-gray-600 mb-2">Injury Details</p>
                              <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                                {selectedIncidentDetails.injury_details}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Reporting & Notifications */}
                    <div className="card bg-gray-50">
                      <div className="card-body">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <i className="ki-outline ki-notification text-xl mr-2 text-warning"></i>
                          Reporting & Notifications
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-600 mb-1">NDIS Reportable</p>
                            <p className="text-base text-gray-900">
                              {selectedIncidentDetails.is_ndis_reportable ? 'Yes' : 'No'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-600 mb-1">Police Notified</p>
                            <p className="text-base text-gray-900">
                              {selectedIncidentDetails.police_notified ? 'Yes' : 'No'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* BSP Analysis */}
                    {(selectedIncidentDetails.bsp_alignment_notes || selectedIncidentDetails.bsp_suggested_improvements) && (
                      <div className="card bg-gray-50">
                        <div className="card-body">
                          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <i className="ki-outline ki-note-2 text-xl mr-2 text-info"></i>
                            BSP Analysis
                          </h4>
                          <div className="space-y-4">
                            {selectedIncidentDetails.bsp_alignment_notes && (
                              <div>
                                <p className="text-sm font-semibold text-gray-600 mb-2">BSP Alignment Notes</p>
                                <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                                  {selectedIncidentDetails.bsp_alignment_notes}
                                </p>
                              </div>
                            )}
                            {selectedIncidentDetails.bsp_suggested_improvements && (
                              <div>
                                <p className="text-sm font-semibold text-gray-600 mb-2">BSP Suggested Improvements</p>
                                <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                                  {selectedIncidentDetails.bsp_suggested_improvements}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Follow-up Actions */}
                    {selectedIncidentDetails.follow_up_required && (
                      <div className="card bg-gray-50">
                        <div className="card-body">
                          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <i className="ki-outline ki-time text-xl mr-2 text-success"></i>
                            Follow-up Actions
                          </h4>
                          <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                            {selectedIncidentDetails.follow_up_actions || 'N/A'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Additional Information */}
                    {selectedIncidentDetails.additional_information && (
                      <div className="card bg-gray-50">
                        <div className="card-body">
                          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <i className="ki-outline ki-notepad text-xl mr-2 text-gray-600"></i>
                            Additional Information
                          </h4>
                          <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                            {selectedIncidentDetails.additional_information}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* AI Generated Report */}
                    {selectedIncidentDetails.generated_report && (
                      <div className="card bg-primary-light/10 border-2 border-primary">
                        <div className="card-body">
                          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <i className="ki-outline ki-ai text-xl mr-2 text-primary"></i>
                            AI-Generated Complete Report
                          </h4>
                          <div className="bg-white p-6 rounded-lg">
                            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                              {selectedIncidentDetails.generated_report}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-600">No incident details available.</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={closeReportModal}
                  style={{ cursor: 'pointer' }}
                >
                  Close
                </button>
                {selectedIncidentDetails && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => window.print()}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="ki-outline ki-printer text-base"></i>
                    Print Report
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export { IncidentsTable };
