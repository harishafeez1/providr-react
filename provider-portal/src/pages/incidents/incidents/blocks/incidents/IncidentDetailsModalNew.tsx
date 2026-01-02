import React from 'react';
import { useNavigate } from 'react-router-dom';

interface IncidentDetailsModalProps {
  showModal: boolean;
  onClose: () => void;
  selectedIncidentDetails: any;
  loadingReport: boolean;
  bspAnalysisData: any;
  loadingBspAnalysis: boolean;
  activeModalTab: 'details' | 'bsp' | 'participant';
  setActiveModalTab: (tab: 'details' | 'bsp' | 'participant') => void;
  collapsedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
  handleRunBspAnalysis: (incidentId: number) => void;
  exportIncidentPdf: (incidentId: number) => void;
  onDelete: (incidentId: number) => void;
  formatDateTime: (dateTime: string) => { date: string; time: string };
  getStatusBadgeClass: (status: string) => string;
  getSeverityBadgeClass: (severity: string) => string;
  getStatusDisplayName: (status: string) => string;
  participantDetails: any;
  loadingParticipant: boolean;
  fetchParticipantDetails?: (participantId: string | number) => void;
}

export const IncidentDetailsModalNew: React.FC<IncidentDetailsModalProps> = ({
  showModal,
  onClose,
  selectedIncidentDetails,
  loadingReport,
  bspAnalysisData,
  loadingBspAnalysis,
  activeModalTab,
  setActiveModalTab,
  collapsedSections,
  toggleSection,
  handleRunBspAnalysis,
  exportIncidentPdf,
  onDelete,
  formatDateTime,
  getStatusBadgeClass,
  getSeverityBadgeClass,
  getStatusDisplayName,
  participantDetails,
  loadingParticipant
}) => {
  const navigate = useNavigate();

  if (!showModal) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <style>
        {`
          /* Animation Keyframes */
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
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          /* ============================================
             CENTRALIZED MODAL WIDTH MANAGEMENT
             ============================================
             This section handles all width-related styling
             for the incident details modal to prevent
             content shrinking issues across all tabs.

             ROOT CAUSE: Flex containers cause children to shrink
             SOLUTION: Explicitly set min-width: 0 and width: 100%
             ============================================ */

          /* Fix flex shrinking in modal */
          .modal-content {
            min-width: 0 !important;
          }

          .modal-body {
            min-width: 0 !important;
            flex-shrink: 0 !important;
          }

          /* Tab Content Wrapper - Applied to all tab containers */
          .incident-modal-tab-content {
            animation: fadeIn 0.3s ease-in-out;
            padding: 0;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box;
            flex-shrink: 0 !important;
          }

          /* All direct children of tab content inherit full width */
          .incident-modal-tab-content > * {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box;
          }

          /* Ensure all modal body content takes full width */
          .modal-body > * {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            box-sizing: border-box;
            flex-shrink: 0;
          }
        `}
      </style>
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          maxWidth: '1400px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0, width: '100%' }}>
          {/* Modal Header */}
          <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h3 className="modal-title" style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                Incident Details
              </h3>
              <span className="badge badge-success" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                <i className="ki-outline ki-check-circle text-xs mr-1"></i>
                NDIS
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-sm btn-light"
                onClick={() => selectedIncidentDetails && exportIncidentPdf(selectedIncidentDetails.id)}
                disabled={!selectedIncidentDetails}
                style={{ cursor: 'pointer' }}
              >
                <i className="ki-outline ki-file-down text-base mr-1"></i>
                Export
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => {
                  if (selectedIncidentDetails) {
                    navigate(`/incidents/${selectedIncidentDetails.id}/edit`);
                  }
                }}
                disabled={!selectedIncidentDetails}
                style={{ cursor: 'pointer' }}
              >
                <i className="ki-outline ki-notepad-edit text-base mr-1"></i>
                Edit
              </button>
              <button
                type="button"
                className="btn btn-sm btn-icon btn-light"
                onClick={() => {
                  if (selectedIncidentDetails) {
                    onDelete(selectedIncidentDetails.id);
                    onClose();
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <i className="ki-outline ki-trash text-base"></i>
              </button>
              <button
                type="button"
                className="btn btn-sm btn-icon btn-light"
                onClick={onClose}
                style={{ cursor: 'pointer' }}
              >
                <i className="ki-outline ki-cross text-base"></i>
              </button>
            </div>
          </div>

          {/* Tab Navigation - Only show when not loading */}
          {!loadingReport && !loadingBspAnalysis && !loadingParticipant && selectedIncidentDetails && (
            <div style={{ borderBottom: '1px solid #e5e7eb', padding: '0 24px', backgroundColor: '#f9fafb' }}>
              <div style={{ display: 'flex', gap: '32px' }}>
                <button
                  onClick={() => setActiveModalTab('details')}
                  style={{
                    padding: '16px 4px',
                    border: 'none',
                    background: 'transparent',
                    fontSize: '0.875rem',
                    fontWeight: activeModalTab === 'details' ? '600' : '500',
                    color: activeModalTab === 'details' ? '#6b46c1' : '#6b7280',
                    borderBottom: activeModalTab === 'details' ? '2px solid #6b46c1' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    top: '1px'
                  }}
                >
                  Incident Details
                </button>
                <button
                  onClick={() => setActiveModalTab('bsp')}
                  style={{
                    padding: '16px 4px',
                    border: 'none',
                    background: 'transparent',
                    fontSize: '0.875rem',
                    fontWeight: activeModalTab === 'bsp' ? '600' : '500',
                    color: activeModalTab === 'bsp' ? '#6b46c1' : '#6b7280',
                    borderBottom: activeModalTab === 'bsp' ? '2px solid #6b46c1' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    top: '1px'
                  }}
                >
                  BSP Analysis
                </button>
                {/* Participant Info Tab */}
                <button
                  onClick={() => setActiveModalTab('participant')}
                  style={{
                    padding: '16px 4px',
                    border: 'none',
                    background: 'transparent',
                    fontSize: '0.875rem',
                    fontWeight: activeModalTab === 'participant' ? '600' : '500',
                    color: activeModalTab === 'participant' ? '#6b46c1' : '#6b7280',
                    borderBottom: activeModalTab === 'participant' ? '2px solid #6b46c1' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    top: '1px'
                  }}
                >
                  Participant Info
                </button>
              </div>
            </div>
          )}

          {/* Modal Body */}
          <div className="modal-body" style={{
            flex: '1 1 auto',
            flexShrink: 0,
            overflowY: 'auto',
            padding: '24px',
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
            boxSizing: 'border-box'
          }}>
            {/* LOADING STATE */}
            {(loadingReport || loadingBspAnalysis || loadingParticipant) ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                padding: '40px 20px',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box'
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
                    borderTop: '4px solid #6b46c1',
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
                    borderBottom: '4px solid #6b46c1',
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
                      backgroundColor: '#6b46c1',
                      animation: 'bounce 1.4s ease-in-out infinite'
                    }}></div>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#6b46c1',
                      animation: 'bounce 1.4s ease-in-out 0.2s infinite'
                    }}></div>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#6b46c1',
                      animation: 'bounce 1.4s ease-in-out 0.4s infinite'
                    }}></div>
                  </div>
                </div>
              </div>
            ) : selectedIncidentDetails ? (
              <div style={{
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box'
              }}>
                {/* NOTE: This is a placeholder - the actual implementation will be completed in the next iteration
                    due to the massive size of the modal content. For now, this shows the structure. */}

                <div className="text-center py-10">
                  <p className="text-gray-600">
                    PLACEHOLDER: Complete modal content from IncidentsTable.tsx will be copied here.
                    <br />
                    This includes all 3 tabs: Incident Details, BSP Analysis, and Participant Info
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-600">No incident details available.</p>
              </div>
            )}
          </div>

          {/* Modal Footer - Only show on Incident Details tab */}
          {activeModalTab === 'details' && !loadingReport && (
            <div className="modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-light"
                onClick={onClose}
                style={{ cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
