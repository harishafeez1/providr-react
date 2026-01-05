import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchSingleIncident, updateIncident, fetchIncidentTypes } from '@/services/api';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { SignatureField, SignatureFieldRef } from '@/components/signature';
import { ParticipantSearch } from '../add-incident/ParticipantSearch';
import { AddParticipantModal } from '../add-incident/AddParticipantModal';
import { DateTimePicker } from '@/components/ui/date-time-picker';

interface IncidentType {
  id: number;
  name: string;
}

interface FormData {
  participant_id: number | null;
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
  const signatureRef = useRef<SignatureFieldRef>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [existingSignature, setExistingSignature] = useState<string | null>(null);
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([]);
  const [formData, setFormData] = useState<FormData>({
    participant_id: null,
    participant_name: '',
    description: '',
    incident_type: 'Other',
    severity: 'Minor',
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
    loadIncidentTypes();
  }, [id]);

  const loadIncidentTypes = async () => {
    try {
      const response = await fetchIncidentTypes();
      setIncidentTypes(response.incident_types || []);
    } catch (error) {
      console.error('Error loading incident types:', error);
      // Fallback to empty array if fetch fails - will use static options
      setIncidentTypes([]);
    }
  };

  const loadIncidentData = async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchSingleIncident(id);
      const incident = response;

      // Populate form with incident data
      setFormData({
        participant_id: incident.participant_id || null,
        participant_name: incident.participant_name || '',
        description: incident.description || '',
        incident_type: typeof incident.incident_type === 'object' ? incident.incident_type?.name || 'Other' : (incident.incident_type || 'Other'),
        severity: incident.severity || 'Minor',
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

      // Set existing signature if available
      if (incident.reporter_signature) {
        setExistingSignature(incident.reporter_signature);
      }
    } catch (err: any) {
      console.error('Error loading incident:', err);
      setError(err?.response?.data?.message || 'Failed to load incident. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!id) return;

    // Get current signature (either new or existing)
    let reporterSignature = existingSignature;
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      reporterSignature = signatureRef.current.getSignature();
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare data for update
      const submitData = {
        participant_id: formData.participant_id,
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
        status: formData.status,
        reporter_signature: reporterSignature
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

  const handleParticipantAdded = (newParticipant: any) => {
    // Automatically select the newly created participant
    updateField('participant_id', newParticipant.id);
    updateField('participant_name', newParticipant.name || `${newParticipant.first_name} ${newParticipant.last_name}`);
  };

  const handleParticipantSelect = (participant: any) => {
    updateField('participant_id', participant.id);
    updateField('participant_name', participant.name || `${participant.first_name} ${participant.last_name}`);
  };

  // Loading View
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="mb-8 relative">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-primary-light dark:border-primary-dark border-t-primary animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <KeenIcon icon="notepad-edit" className="ki-outline text-4xl text-primary" />
              </div>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Loading Incident</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-2 max-w-md mx-auto">
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
        <div className="alert alert-danger dark:bg-danger/10">
          <div className="flex items-start gap-3">
            <KeenIcon icon="information" className="ki-outline text-lg text-danger dark:text-danger-light" />
            <span className="text-sm text-gray-900 dark:text-gray-100">{error}</span>
          </div>
        </div>
      )}

      {/* Tabbed Form with Custom Button Tabs */}
      <Card>
        <CardHeader className="border-b-0 pb-0">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeTab === 'basic' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('basic')}
              className="gap-2"
            >
              <KeenIcon icon="information" className="ki-outline text-base" />
              Basic Information
            </Button>
            <Button
              variant={activeTab === 'ndis' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('ndis')}
              className="gap-2"
            >
              <KeenIcon icon="shield-tick" className="ki-outline text-base" />
              NDIS Details
            </Button>
            <Button
              variant={activeTab === 'medical' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('medical')}
              className="gap-2"
            >
              <KeenIcon icon="pulse" className="ki-outline text-base" />
              Medical & Reporting
            </Button>
            <Button
              variant={activeTab === 'bsp' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('bsp')}
              className="gap-2"
            >
              <KeenIcon icon="note-2" className="ki-outline text-base" />
              BSP Analysis
            </Button>
            <Button
              variant={activeTab === 'followup' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('followup')}
              className="gap-2"
            >
              <KeenIcon icon="time" className="ki-outline text-base" />
              Follow-up & Additional
            </Button>
            <Button
              variant={activeTab === 'signature' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('signature')}
              className="gap-2"
            >
              <KeenIcon icon="pencil" className="ki-outline text-base" />
              Signature
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-5">
              <div className="flex items-start flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1 mt-2.5">
                  <KeenIcon icon="calendar" className="text-sm" />
                  Incident Date & Time <span className="text-danger">*</span>
                </label>
                <DateTimePicker
                  mode="datetime"
                  value={formData.incident_date_time}
                  onChange={(value) => updateField('incident_date_time', value)}
                  placeholder="Select date and time"
                  className="flex-1 min-w-0"
                  required
                />
              </div>

              <div className="flex items-start flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1 mt-2.5">
                  <KeenIcon icon="geolocation" className="text-sm" />
                  Location <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="input flex-1 min-w-0"
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="Enter incident location"
                />
              </div>

              <div className="flex items-start flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1 mt-2.5">
                  <KeenIcon icon="user" className="text-sm" />
                  Participant
                </label>
                <div className="flex flex-1 min-w-0 gap-2">
                  <ParticipantSearch
                    onSelect={handleParticipantSelect}
                    initialValue={formData.participant_name || ''}
                    placeholder="Search participants..."
                    disabled={false}
                  />
                  <Button
                    variant="light"
                    size="sm"
                    onClick={() => setIsParticipantModalOpen(true)}
                    className="shrink-0"
                  >
                    <KeenIcon icon="plus" className="ki-outline text-base" />
                  </Button>
                </div>
              </div>

              <div className="flex items-start flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1 mt-2.5">
                  <KeenIcon icon="category" className="text-sm" />
                  Incident Type
                </label>
                <Select
                  value={formData.incident_type}
                  onValueChange={(value) => updateField('incident_type', value)}
                >
                  <SelectTrigger className="flex-1 min-w-0">
                    <SelectValue placeholder="Select incident type" />
                  </SelectTrigger>
                  <SelectContent>
                    {incidentTypes.length > 0 ? (
                      incidentTypes.map((type) => (
                        <SelectItem key={type.id} value={type.name}>
                          {type.name}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="Physical Aggression">Physical Aggression</SelectItem>
                        <SelectItem value="Verbal Aggression">Verbal Aggression</SelectItem>
                        <SelectItem value="Self-Harm">Self-Harm</SelectItem>
                        <SelectItem value="Property Damage">Property Damage</SelectItem>
                        <SelectItem value="Elopement">Elopement</SelectItem>
                        <SelectItem value="Medical Emergency">Medical Emergency</SelectItem>
                        <SelectItem value="Medication Error">Medication Error</SelectItem>
                        <SelectItem value="Fall">Fall</SelectItem>
                        <SelectItem value="Abuse/Neglect Allegation">Abuse/Neglect Allegation</SelectItem>
                        <SelectItem value="Unauthorized Absence">Unauthorized Absence</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-start flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1 mt-2.5">
                  <KeenIcon icon="chart" className="text-sm" />
                  Severity Level <span className="text-danger">*</span>
                </label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) => updateField('severity', value)}
                >
                  <SelectTrigger className="flex-1 min-w-0">
                    <SelectValue placeholder="Select severity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Minor">Minor</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Serious">Serious</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-start flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1 mt-2.5">
                  <KeenIcon icon="flag" className="text-sm" />
                  Status
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => updateField('status', value)}
                >
                  <SelectTrigger className="flex-1 min-w-0">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-start flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1 mt-2.5">
                  <KeenIcon icon="note-2" className="text-sm" />
                  Incident Description <span className="text-danger">*</span>
                </label>
                <textarea
                  className="input flex-1 min-w-0 min-h-[150px] resize-y p-3"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Provide detailed description of the incident..."
                />
              </div>
            </div>
          )}

          {/* NDIS Details Tab */}
          {activeTab === 'ndis' && (
            <div className="space-y-5">
              <div className="flex items-start flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1 mt-2.5">
                  <KeenIcon icon="shield-tick" className="text-sm" />
                  What Happened
                </label>
                <textarea
                  className="input flex-1 min-w-0 min-h-[100px] resize-y p-3"
                  value={formData.what_happened}
                  onChange={(e) => updateField('what_happened', e.target.value)}
                  placeholder="Observable behaviours only..."
                />
              </div>

              <div className="flex items-start flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1 mt-2.5">
                  <KeenIcon icon="flash-circle" className="text-sm" />
                  Lead-up & Triggers
                </label>
                <textarea
                  className="input flex-1 min-w-0 min-h-[100px] resize-y p-3"
                  value={formData.lead_up_triggers}
                  onChange={(e) => updateField('lead_up_triggers', e.target.value)}
                  placeholder="What led to the incident..."
                />
              </div>

              <div className="flex items-start flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1 mt-2.5">
                  <KeenIcon icon="time" className="text-sm" />
                  During the Incident
                </label>
                <textarea
                  className="input flex-1 min-w-0 min-h-[100px] resize-y p-3"
                  value={formData.during_incident}
                  onChange={(e) => updateField('during_incident', e.target.value)}
                  placeholder="What happened during..."
                />
              </div>

              <div className="flex items-start flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1 mt-2.5">
                  <KeenIcon icon="security-user" className="text-sm" />
                  Staff Response & Actions
                </label>
                <textarea
                  className="input flex-1 min-w-0 min-h-[100px] resize-y p-3"
                  value={formData.response_actions}
                  onChange={(e) => updateField('response_actions', e.target.value)}
                  placeholder="How staff responded..."
                />
              </div>

              <div className="flex items-start flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1 mt-2.5">
                  <KeenIcon icon="chart-line" className="text-sm" />
                  Causes & Contributing Factors
                </label>
                <textarea
                  className="input flex-1 min-w-0 min-h-[100px] resize-y p-3"
                  value={formData.causes_contributing_factors}
                  onChange={(e) => updateField('causes_contributing_factors', e.target.value)}
                  placeholder="Root causes and factors..."
                />
              </div>
            </div>
          )}

          {/* Medical & Reporting Tab */}
          {activeTab === 'medical' && (
            <div className="space-y-5">
              <Card className="bg-gray-50 dark:bg-gray-900">
                <CardContent>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Medical Information</h4>
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
                      <label className="form-label font-medium text-gray-900 dark:text-gray-100">Injury Details</label>
                      <textarea
                        className="input flex-1 min-w-0 min-h-[100px] resize-y p-3"
                        value={formData.injury_details}
                        onChange={(e) => updateField('injury_details', e.target.value)}
                        placeholder="Describe injuries in detail..."
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-50 dark:bg-gray-900">
                <CardContent>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Reporting & Notifications</h4>
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
                </CardContent>
              </Card>
            </div>
          )}

          {/* BSP Analysis Tab */}
          {activeTab === 'bsp' && (
            <div className="space-y-5">
              <div className="flex items-start flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1 mt-2.5">
                  <KeenIcon icon="note-2" className="text-sm" />
                  BSP Alignment Notes
                </label>
                <textarea
                  className="input flex-1 min-w-0 min-h-[120px] resize-y p-3"
                  value={formData.bsp_alignment_notes}
                  onChange={(e) => updateField('bsp_alignment_notes', e.target.value)}
                  placeholder="How does this incident align with the participant's BSP..."
                />
              </div>

              <div className="flex items-start flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1 mt-2.5">
                  <KeenIcon icon="rocket" className="text-sm" />
                  BSP Suggested Improvements
                </label>
                <textarea
                  className="input flex-1 min-w-0 min-h-[120px] resize-y p-3"
                  value={formData.bsp_suggested_improvements}
                  onChange={(e) => updateField('bsp_suggested_improvements', e.target.value)}
                  placeholder="Recommendations for BSP updates..."
                />
              </div>
            </div>
          )}

          {/* Follow-up & Additional Tab */}
          {activeTab === 'followup' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={formData.follow_up_required}
                  onChange={(e) => updateField('follow_up_required', e.target.checked)}
                />
                <label className="form-label mb-0 font-semibold">Follow-up Required</label>
              </div>

              {formData.follow_up_required && (
                <div className="flex items-start flex-wrap gap-2.5">
                  <label className="form-label max-w-70 gap-1 mt-2.5">
                    <KeenIcon icon="route" className="text-sm" />
                    Follow-up Actions
                  </label>
                  <textarea
                    className="input flex-1 min-w-0 min-h-[150px] resize-y p-3"
                    value={formData.follow_up_actions}
                    onChange={(e) => updateField('follow_up_actions', e.target.value)}
                    placeholder="Describe required follow-up actions..."
                  />
                </div>
              )}

              <div className="flex items-start flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1 mt-2.5">
                  <KeenIcon icon="notepad" className="text-sm" />
                  Additional Information
                </label>
                <textarea
                  className="input flex-1 min-w-0 min-h-[120px] resize-y p-3"
                  value={formData.additional_information}
                  onChange={(e) => updateField('additional_information', e.target.value)}
                  placeholder="Any other relevant information..."
                />
              </div>
            </div>
          )}

          {/* Signature Tab */}
          {activeTab === 'signature' && (
            <div className="space-y-5">
              {existingSignature && (
                <div className="flex items-start flex-wrap gap-2.5">
                  <label className="form-label max-w-70 gap-1 mt-2.5">
                    <KeenIcon icon="check-circle" className="text-sm" />
                    Current Signature
                  </label>
                  <div className="flex-1 min-w-0">
                    <div className="bg-success-light/10 border-l-4 border-success p-4 rounded mb-3">
                      <p className="text-sm text-gray-900 dark:text-gray-100 mb-3">
                        A signature is already on file. You can keep it or draw a new one below to replace it.
                      </p>
                      <img
                        src={existingSignature}
                        alt="Existing Signature"
                        className="border-2 border-gray-300 dark:border-gray-600 rounded max-w-md"
                        style={{ maxHeight: '150px' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-start flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1 mt-2.5">
                  <KeenIcon icon="shield-tick" className="text-sm" />
                  Confirmation Statement
                </label>
                <div className="flex-1 min-w-0">
                  <div className="bg-info-light/10 border-l-4 border-info p-4 rounded">
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      I confirm that the information in this report is true and accurate to the best of my knowledge.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1 mt-2.5">
                  <KeenIcon icon="pencil" className="text-sm" />
                  {existingSignature ? 'Update Signature' : 'Reporter Signature'} {!existingSignature && <span className="text-danger">*</span>}
                </label>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {existingSignature
                      ? 'Draw a new signature below to replace the existing one, or leave blank to keep it.'
                      : 'Draw your signature using your mouse or touchscreen in the box below.'}
                  </p>
                  <SignatureField
                    ref={signatureRef}
                    label=""
                    required={!existingSignature}
                    defaultValue={null}
                    width={700}
                    height={200}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between gap-4">
        <Button
          variant="light"
          onClick={handleBack}
          disabled={isSubmitting}
        >
          <KeenIcon icon="left" className="ki-outline text-base" />
          Back to Incidents
        </Button>
        <Button
          variant="default"
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
              <KeenIcon icon="check" className="ki-outline text-base" />
              Update Incident
            </>
          )}
        </Button>
      </div>

      {/* Add Participant Modal */}
      <AddParticipantModal
        open={isParticipantModalOpen}
        onOpenChange={setIsParticipantModalOpen}
        onParticipantAdded={handleParticipantAdded}
      />
    </div>
  );
};

export { EditIncidentContent };
