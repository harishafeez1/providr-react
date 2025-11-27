import { Fragment, useState, useEffect } from 'react';
import { Container } from '@/components/container';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/partials/toolbar';
import { Link, useLocation } from 'react-router-dom';
import { fetchAllIncidents, deleteIncident, fetchSingleIncident } from '@/services/api';

interface Incident {
  id: number;
  incident_number: string;
  incident_type: string;
  severity: string;
  incident_date_time: string;
  participant_name: string | null;
  injury_occurred: boolean;
  status: string;
  customer?: {
    first_name?: string;
    last_name?: string;
  };
}

const IncidentsPage = () => {
  const location = useLocation();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedIncidentDetails, setSelectedIncidentDetails] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [incidentToDelete, setIncidentToDelete] = useState<Incident | null>(null);

  useEffect(() => {
    loadIncidents();

    // Check for success message from navigation state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
      // Clear location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const loadIncidents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAllIncidents();
      console.log('API Response:', data); // Debug log

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

      console.log('Processed incidents:', incidentsData); // Debug log
      setIncidents(incidentsData);
    } catch (err: any) {
      console.error('Error fetching incidents:', err);
      console.error('Error details:', err?.response?.data); // Debug log
      setError(err?.response?.data?.message || 'Failed to load incidents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'low':
        return 'badge-success';
      case 'medium':
        return 'badge-warning';
      case 'high':
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

  const handleDeleteClick = (incident: Incident) => {
    setIncidentToDelete(incident);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setIncidentToDelete(null);
  };

  const confirmDelete = async () => {
    if (!incidentToDelete) return;

    setDeletingId(incidentToDelete.id);
    setError(null);
    setShowDeleteModal(false);

    try {
      const response = await deleteIncident(incidentToDelete.id);
      setSuccessMessage(response.message || 'Incident deleted successfully');

      // Reload incidents list
      await loadIncidents();

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Error deleting incident:', err);
      setError(
        err?.response?.data?.message ||
        'Failed to delete incident. Please try again.'
      );

      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setDeletingId(null);
      setIncidentToDelete(null);
    }
  };

  const handleViewDetails = async (incidentId: number) => {
    setShowReportModal(true);
    setLoadingReport(true);

    try {
      const response = await fetchSingleIncident(incidentId);
      // API returns the incident object directly
      setSelectedIncidentDetails(response);
    } catch (err: any) {
      console.error('Error fetching incident details:', err);
      setError(
        err?.response?.data?.message ||
        'Failed to load incident details. Please try again.'
      );
      setShowReportModal(false);
    } finally {
      setLoadingReport(false);
    }
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setSelectedIncidentDetails(null);
  };

  return (
    <Fragment>
      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.5;
              transform: scale(0.95);
            }
          }

          @keyframes bounce {
            0%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-10px);
            }
          }
        `}
      </style>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <h1 className="text-xl font-medium leading-none text-gray-900">Incidents</h1>
            {!isLoading && incidents && (
              <p className="text-sm text-gray-600 mt-1">
                {incidents.length} {incidents.length === 1 ? 'incident' : 'incidents'} recorded
              </p>
            )}
          </ToolbarHeading>
          <ToolbarActions>
            <Link to="/incidents/add-incident" className="btn btn-sm btn-primary">
              <i className="ki-outline ki-plus text-base"></i>
              Add Incident
            </Link>
          </ToolbarActions>
        </Toolbar>

        {/* Success Message */}
        {successMessage && (
          <div className="alert alert-success">
            <div className="flex items-start gap-3">
              <i className="ki-outline ki-check-circle text-lg text-success"></i>
              <span className="text-sm text-gray-900">{successMessage}</span>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-body p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-10">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full border-4 border-primary-light border-t-primary animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading incidents...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center p-10">
                <div className="text-center">
                  <i className="ki-outline ki-information text-5xl text-danger mb-4"></i>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Incidents</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button onClick={loadIncidents} className="btn btn-sm btn-primary">
                    <i className="ki-outline ki-arrows-circle text-base"></i>
                    Try Again
                  </button>
                </div>
              </div>
            ) : !incidents || incidents.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10">
                <div className="text-center">
                  <i className="ki-outline ki-information-2 text-6xl text-gray-400 mb-4"></i>
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">No Incidents</h2>
                  <p className="text-gray-500 mb-4">There are currently no incidents to display.</p>
                  <Link to="/incidents/add-incident" className="btn btn-sm btn-primary">
                    <i className="ki-outline ki-plus text-base"></i>
                    Report First Incident
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-auto">
                  <thead>
                    <tr>
                      <th className="min-w-[150px]">Incident Number</th>
                      <th className="min-w-[180px]">Date & Time</th>
                      <th className="min-w-[100px]">Severity</th>
                      <th className="min-w-[150px]">Participant</th>
                      <th className="min-w-[150px]">Type</th>
                      <th className="min-w-[80px] text-center">Injury</th>
                      <th className="min-w-[100px]">Status</th>
                      <th className="min-w-[100px] text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.map((incident) => (
                      <tr key={incident.id}>
                        <td>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                              {incident.incident_number}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="text-sm text-gray-700">
                            {formatDateTime(incident.incident_date_time)}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getSeverityBadgeClass(incident.severity)}`}>
                            {incident.severity || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className="text-sm text-gray-700">
                            {incident.participant_name ||
                              (incident.customer
                                ? `${incident.customer.first_name || ''} ${incident.customer.last_name || ''}`.trim()
                                : 'N/A')}
                          </span>
                        </td>
                        <td>
                          <span className="text-sm text-gray-700">
                            {incident.incident_type || 'N/A'}
                          </span>
                        </td>
                        <td className="text-center">
                          {incident.injury_occurred ? (
                            <span className="badge badge-danger badge-sm">Yes</span>
                          ) : (
                            <span className="badge badge-success badge-sm">No</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(incident.status)}`}>
                            {getStatusDisplayName(incident.status)}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewDetails(incident.id)}
                              className="btn btn-xs btn-light"
                              title="View Details"
                            >
                              <i className="ki-outline ki-eye text-base"></i>
                            </button>
                            <Link
                              to={`/incidents/${incident.id}/edit`}
                              className="btn btn-xs btn-light"
                              title="Edit"
                            >
                              <i className="ki-outline ki-notepad-edit text-base"></i>
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(incident)}
                              className="btn btn-xs btn-light"
                              title="Delete"
                              disabled={deletingId === incident.id}
                            >
                              {deletingId === incident.id ? (
                                <span className="spinner-border spinner-border-sm"></span>
                              ) : (
                                <i className="ki-outline ki-trash text-base"></i>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Container>

      {/* Report Modal - Placed outside Container to avoid CSS conflicts */}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && incidentToDelete && (
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
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeDeleteModal();
            }
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              backgroundColor: '#fef2f2'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="ki-outline ki-information text-3xl text-danger"></i>
              </div>
              <div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  margin: 0,
                  color: '#991b1b'
                }}>
                  Delete Incident
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  margin: '4px 0 0 0'
                }}>
                  This action cannot be undone
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              <p style={{
                fontSize: '0.9375rem',
                color: '#374151',
                lineHeight: '1.6',
                margin: 0
              }}>
                Are you sure you want to delete incident{' '}
                <strong style={{ color: '#111827' }}>
                  {incidentToDelete.incident_number}
                </strong>
                ?
              </p>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                lineHeight: '1.5',
                marginTop: '12px',
                marginBottom: 0
              }}>
                All incident data including NDIS reports, medical information, and BSP analysis will be permanently removed from the system.
              </p>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              backgroundColor: '#f9fafb'
            }}>
              <button
                type="button"
                className="btn btn-light"
                onClick={closeDeleteModal}
                style={{ cursor: 'pointer', minWidth: '100px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={confirmDelete}
                style={{ cursor: 'pointer', minWidth: '100px' }}
              >
                <i className="ki-outline ki-trash text-base mr-1"></i>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export { IncidentsPage };
