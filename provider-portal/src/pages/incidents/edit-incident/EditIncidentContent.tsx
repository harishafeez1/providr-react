import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchSingleIncident, updateIncident } from '@/services/api';

interface FormData {
  customer_id: number | null;
  participant_name: string;
  description: string;
  incident_type: string;
  severity: string;
  incident_date_time: string;
  location: string;
  injury_occurred: boolean;
  medical_treatment_required: boolean;
  injury_details: string;
  is_ndis_reportable: boolean;
  police_notified: boolean;
  follow_up_required: boolean;
  follow_up_actions: string;
  what_happened: string;
  lead_up_triggers: string;
  during_incident: string;
  response_actions: string;
  causes_contributing_factors: string;
  bsp_alignment_notes: string;
  bsp_suggested_improvements: string;
  additional_information: string;
  status: string;
}

const EditIncidentContent = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<FormData>({
    customer_id: null,
    participant_name: '',
    description: '',
    incident_type: 'Other',
    severity: 'Low',
    incident_date_time: '',
    location: '',
    injury_occurred: false,
    medical_treatment_required: false,
    injury_details: '',
    is_ndis_reportable: false,
    police_notified: false,
    follow_up_required: false,
    follow_up_actions: '',
    what_happened: '',
    lead_up_triggers: '',
    during_incident: '',
    response_actions: '',
    causes_contributing_factors: '',
    bsp_alignment_notes: '',
    bsp_suggested_improvements: '',
    additional_information: '',
    status: 'draft'
  });

  useEffect(() => {
    loadIncidentData();
  }, [id]);

  const loadIncidentData = async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchSingleIncident(id);
      const incident = response;

      // Populate form with incident data
      setFormData({
        customer_id: incident.customer_id || null,
        participant_name: incident.participant_name || '',
        description: incident.description || '',
        incident_type: incident.incident_type || 'Other',
        severity: incident.severity || 'Low',
        incident_date_time: incident.incident_date_time ? incident.incident_date_time.replace('Z', '').replace('.000000', '') : '',
        location: incident.location || '',
        injury_occurred: incident.injury_occurred || false,
        medical_treatment_required: incident.medical_treatment_required || false,
        injury_details: incident.injury_details || '',
        is_ndis_reportable: incident.is_ndis_reportable || false,
        police_notified: incident.police_notified || false,
        follow_up_required: incident.follow_up_required || false,
        follow_up_actions: incident.follow_up_actions || '',
        what_happened: incident.what_happened || '',
        lead_up_triggers: incident.lead_up_triggers || '',
        during_incident: incident.during_incident || '',
        response_actions: incident.response_actions || '',
        causes_contributing_factors: incident.causes_contributing_factors || '',
        bsp_alignment_notes: incident.bsp_alignment_notes || '',
        bsp_suggested_improvements: incident.bsp_suggested_improvements || '',
        additional_information: incident.additional_information || '',
        status: incident.status || 'draft'
      });
    } catch (err: any) {
      console.error('Error loading incident:', err);
      setError(err?.response?.data?.message || 'Failed to load incident. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!id) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare data for update
      const submitData = {
        customer_id: formData.customer_id,
        participant_name: formData.participant_name,
        description: formData.description,
        incident_type: formData.incident_type,
        severity: formData.severity,
        incident_date_time: formData.incident_date_time,
        location: formData.location,
        injury_occurred: formData.injury_occurred,
        medical_treatment_required: formData.medical_treatment_required,
        injury_details: formData.injury_details,
        is_ndis_reportable: formData.is_ndis_reportable,
        police_notified: formData.police_notified,
        follow_up_required: formData.follow_up_required,
        follow_up_actions: formData.follow_up_actions,
        status: formData.status
      };

      const response = await updateIncident(id, submitData);

      console.log('Incident updated successfully:', response);

      // Navigate to incidents list with success message
      navigate('/incidents', {
        state: {
          message: response.message || 'Incident updated successfully',
          type: 'success'
        }
      });
    } catch (err: any) {
      console.error('Error updating incident:', err);
      setError(
        err?.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(', ')
          : err?.response?.data?.message || 'Failed to update incident. Please try again.'
      );

      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBack = () => {
    navigate('/incidents');
  };

  // Loading View
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="mb-8 relative">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-primary-light border-t-primary animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="ki-outline ki-notepad-edit text-4xl text-primary"></i>
              </div>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Loading Incident</h3>
          <p className="text-gray-600 mb-2 max-w-md mx-auto">
            Fetching incident details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:gap-7.5">
      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger">
          <div className="flex items-start gap-3">
            <i className="ki-outline ki-information text-lg text-danger"></i>
            <span className="text-sm text-gray-900">{error}</span>
          </div>
        </div>
      )}

      {/* Tabbed Form */}
      <div className="card">
        {/* Tab Navigation */}
        <div className="card-header border-b-0 pb-0">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'basic'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ki-outline ki-information text-base mr-2"></i>
              Basic Information
            </button>
            <button
              onClick={() => setActiveTab('ndis')}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'ndis'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ki-outline ki-shield-tick text-base mr-2"></i>
              NDIS Details
            </button>
            <button
              onClick={() => setActiveTab('medical')}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'medical'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ki-outline ki-pulse text-base mr-2"></i>
              Medical & Reporting
            </button>
            <button
              onClick={() => setActiveTab('bsp')}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'bsp'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ki-outline ki-note-2 text-base mr-2"></i>
              BSP Analysis
            </button>
            <button
              onClick={() => setActiveTab('followup')}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'followup'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ki-outline ki-time text-base mr-2"></i>
              Follow-up & Additional
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="card-body">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="grid gap-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="form-label font-medium text-gray-900">
                    Incident Date & Time <span className="text-danger">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="input"
                    value={formData.incident_date_time}
                    onChange={(e) => updateField('incident_date_time', e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="form-label font-medium text-gray-900">
                    Location <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    placeholder="Enter incident location"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="form-label font-medium text-gray-900">Participant Name</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.participant_name}
                    onChange={(e) => updateField('participant_name', e.target.value)}
                    placeholder="Enter participant name"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="form-label font-medium text-gray-900">Incident Type</label>
                  <select
                    className="input"
                    value={formData.incident_type}
                    onChange={(e) => updateField('incident_type', e.target.value)}
                  >
                    <option>Verbal Aggression</option>
                    <option>Physical Aggression</option>
                    <option>Property Damage</option>
                    <option>Self-Harm</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="form-label font-medium text-gray-900">Severity Level</label>
                  <select
                    className="input"
                    value={formData.severity}
                    onChange={(e) => updateField('severity', e.target.value)}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="form-label font-medium text-gray-900">Status</label>
                  <select
                    className="input"
                    value={formData.status}
                    onChange={(e) => updateField('status', e.target.value)}
                  >
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="form-label font-medium text-gray-900">
                  Incident Description <span className="text-danger">*</span>
                </label>
                <textarea
                  className="input min-h-[150px]"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Provide detailed description of the incident..."
                />
              </div>
            </div>
          )}

          {/* NDIS Details Tab */}
          {activeTab === 'ndis' && (
            <div className="grid gap-5">
              <div className="flex flex-col gap-2">
                <label className="form-label font-medium text-gray-900">What Happened</label>
                <textarea
                  className="input min-h-[100px]"
                  value={formData.what_happened}
                  onChange={(e) => updateField('what_happened', e.target.value)}
                  placeholder="Observable behaviours only..."
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="form-label font-medium text-gray-900">Lead-up & Triggers</label>
                <textarea
                  className="input min-h-[100px]"
                  value={formData.lead_up_triggers}
                  onChange={(e) => updateField('lead_up_triggers', e.target.value)}
                  placeholder="What led to the incident..."
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="form-label font-medium text-gray-900">During the Incident</label>
                <textarea
                  className="input min-h-[100px]"
                  value={formData.during_incident}
                  onChange={(e) => updateField('during_incident', e.target.value)}
                  placeholder="What happened during..."
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="form-label font-medium text-gray-900">Staff Response & Actions</label>
                <textarea
                  className="input min-h-[100px]"
                  value={formData.response_actions}
                  onChange={(e) => updateField('response_actions', e.target.value)}
                  placeholder="How staff responded..."
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="form-label font-medium text-gray-900">Causes & Contributing Factors</label>
                <textarea
                  className="input min-h-[100px]"
                  value={formData.causes_contributing_factors}
                  onChange={(e) => updateField('causes_contributing_factors', e.target.value)}
                  placeholder="Root causes and factors..."
                />
              </div>
            </div>
          )}

          {/* Medical & Reporting Tab */}
          {activeTab === 'medical' && (
            <div className="grid gap-5">
              <div className="card bg-gray-50">
                <div className="card-body">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Medical Information</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={formData.injury_occurred}
                        onChange={(e) => updateField('injury_occurred', e.target.checked)}
                      />
                      <label className="form-label mb-0">Injury Occurred</label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={formData.medical_treatment_required}
                        onChange={(e) => updateField('medical_treatment_required', e.target.checked)}
                      />
                      <label className="form-label mb-0">Medical Treatment Required</label>
                    </div>
                  </div>

                  {formData.injury_occurred && (
                    <div className="flex flex-col gap-2 mt-4">
                      <label className="form-label font-medium text-gray-900">Injury Details</label>
                      <textarea
                        className="input min-h-[100px]"
                        value={formData.injury_details}
                        onChange={(e) => updateField('injury_details', e.target.value)}
                        placeholder="Describe injuries in detail..."
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="card bg-gray-50">
                <div className="card-body">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Reporting & Notifications</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={formData.is_ndis_reportable}
                        onChange={(e) => updateField('is_ndis_reportable', e.target.checked)}
                      />
                      <label className="form-label mb-0">NDIS Reportable</label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={formData.police_notified}
                        onChange={(e) => updateField('police_notified', e.target.checked)}
                      />
                      <label className="form-label mb-0">Police Notified</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BSP Analysis Tab */}
          {activeTab === 'bsp' && (
            <div className="grid gap-5">
              <div className="flex flex-col gap-2">
                <label className="form-label font-medium text-gray-900">BSP Alignment Notes</label>
                <textarea
                  className="input min-h-[120px]"
                  value={formData.bsp_alignment_notes}
                  onChange={(e) => updateField('bsp_alignment_notes', e.target.value)}
                  placeholder="How does this incident align with the participant's BSP..."
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="form-label font-medium text-gray-900">BSP Suggested Improvements</label>
                <textarea
                  className="input min-h-[120px]"
                  value={formData.bsp_suggested_improvements}
                  onChange={(e) => updateField('bsp_suggested_improvements', e.target.value)}
                  placeholder="Recommendations for BSP updates..."
                />
              </div>
            </div>
          )}

          {/* Follow-up & Additional Tab */}
          {activeTab === 'followup' && (
            <div className="grid gap-5">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={formData.follow_up_required}
                  onChange={(e) => updateField('follow_up_required', e.target.checked)}
                />
                <label className="form-label mb-0 font-semibold">Follow-up Required</label>
              </div>

              {formData.follow_up_required && (
                <div className="flex flex-col gap-2">
                  <label className="form-label font-medium text-gray-900">Follow-up Actions</label>
                  <textarea
                    className="input min-h-[150px]"
                    value={formData.follow_up_actions}
                    onChange={(e) => updateField('follow_up_actions', e.target.value)}
                    placeholder="Describe required follow-up actions..."
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="form-label font-medium text-gray-900">Additional Information</label>
                <textarea
                  className="input min-h-[120px]"
                  value={formData.additional_information}
                  onChange={(e) => updateField('additional_information', e.target.value)}
                  placeholder="Any other relevant information..."
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between gap-4">
        <button
          type="button"
          className="btn btn-light"
          onClick={handleBack}
          disabled={isSubmitting}
        >
          <i className="ki-outline ki-left text-base"></i>
          Back to Incidents
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Updating...
            </>
          ) : (
            <>
              <i className="ki-outline ki-check text-base"></i>
              Update Incident
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export { EditIncidentContent };
