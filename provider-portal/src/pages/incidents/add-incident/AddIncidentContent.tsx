import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchIncidentCustomers, createIncidentPreview, storeIncident } from '@/services/api';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  ndis: number;
}

interface AISuggestions {
  category: {
    value: string;
    confidence: string;
  };
  severity: {
    value: string;
    reason: string;
  };
  contributing_factors: string[];
  disclaimer: string;
  draft_summary?: string;
}

interface IncidentType {
  id: number;
  name: string;
  selected?: boolean;
}

interface FormData {
  basic_info: {
    customer_id: number;
    participant_name: string | null;
    description: string;
    incident_date_time: string;
    location: string;
    incident_type: string;
    incident_type_id: number | null;
    severity: string;
  };
  ndis_details: {
    what_happened: string;
    lead_up_triggers: string;
    during_incident: string;
    response_actions: string;
    causes_contributing_factors: string;
  };
  medical: {
    injury_occurred: boolean;
    medical_treatment_required: boolean;
    injury_details: string;
  };
  reporting: {
    is_ndis_reportable: boolean;
    police_notified: boolean;
  };
  bsp_analysis: {
    bsp_alignment_notes: string;
    bsp_suggested_improvements: string;
  };
  follow_up: {
    follow_up_required: boolean;
    follow_up_actions: string;
  };
  additional: {
    additional_information: string;
  };
}

interface IncidentPreview {
  message: string;
  incident_types: IncidentType[];
  ai_suggestions: AISuggestions;
  form_data: FormData;
  generated_report: string;
}

const AddIncidentContent = () => {
  const navigate = useNavigate();
  const [incidentNarrative, setIncidentNarrative] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<IncidentPreview | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  // Fetch customers on component mount
  useEffect(() => {
    const loadCustomers = async () => {
      setIsLoadingCustomers(true);
      try {
        const data = await fetchIncidentCustomers();
        setCustomers(data?.customers || data || []);
      } catch (err) {
        console.error('Failed to load customers:', err);
        setError('Failed to load participants. Please try again.');
      } finally {
        setIsLoadingCustomers(false);
      }
    };

    loadCustomers();
  }, []);

  const handleExtractFields = async () => {
    if (!incidentNarrative.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const incidentData = {
        description: incidentNarrative,
        ...(selectedParticipant && { customer_id: parseInt(selectedParticipant) })
      };

      const response = await createIncidentPreview(incidentData);

      console.log('Incident preview created successfully:', response);

      // Set preview data and show preview
      setPreviewData(response);
      setShowPreview(true);
      setActiveTab('basic');
    } catch (err: any) {
      console.error('Error creating incident preview:', err);
      setError(err?.response?.data?.message || 'Failed to create incident preview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!previewData) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const { form_data, ai_suggestions } = previewData;

      // Prepare data matching Laravel validation requirements
      const submitData = {
        customer_id: form_data.basic_info.customer_id,
        participant_name: form_data.basic_info.participant_name,
        description: form_data.basic_info.description,
        incident_type: form_data.basic_info.incident_type_id,
        severity: form_data.basic_info.severity,
        incident_date_time: form_data.basic_info.incident_date_time,
        location: form_data.basic_info.location,

        // Medical fields
        injury_occurred: form_data.medical.injury_occurred,
        medical_treatment_required: form_data.medical.medical_treatment_required,
        injury_details: form_data.medical.injury_details,

        // Reporting fields
        is_ndis_reportable: form_data.reporting.is_ndis_reportable,
        police_notified: form_data.reporting.police_notified,

        // Follow-up fields
        follow_up_required: form_data.follow_up.follow_up_required,
        follow_up_actions: form_data.follow_up.follow_up_actions,

        // NDIS detailed fields
        key_contributing_factors: ai_suggestions.contributing_factors,
        what_happened: form_data.ndis_details.what_happened,
        lead_up_triggers: form_data.ndis_details.lead_up_triggers,
        during_incident: form_data.ndis_details.during_incident,
        response_actions: form_data.ndis_details.response_actions,
        causes_contributing_factors: form_data.ndis_details.causes_contributing_factors,

        // BSP Analysis
        bsp_alignment_notes: form_data.bsp_analysis.bsp_alignment_notes,
        bsp_suggested_improvements: form_data.bsp_analysis.bsp_suggested_improvements,

        // Additional
        additional_information: form_data.additional.additional_information,

        // Generated report
        generated_report: previewData.generated_report,
      };

      const response = await storeIncident(submitData);

      console.log('Incident stored successfully:', response);

      // Navigate to incidents list with success message
      navigate('/incidents', {
        state: {
          message: response.message || 'Incident report submitted successfully',
          type: 'success'
        }
      });
    } catch (err: any) {
      console.error('Error submitting incident:', err);
      setError(err?.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : err?.response?.data?.message || 'Failed to submit incident report. Please try again.');

      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (section: keyof FormData, field: string, value: any) => {
    if (!previewData) return;
    setPreviewData({
      ...previewData,
      form_data: {
        ...previewData.form_data,
        [section]: {
          ...previewData.form_data[section],
          [field]: value
        }
      }
    });
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
              <div className="w-24 h-24 rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-primary animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <KeenIcon icon="ai" className="ki-outline text-4xl text-primary" />
              </div>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Preparing NDIS AI Report
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-2 max-w-md mx-auto">
            Our AI is analyzing the incident and generating a comprehensive NDIS-compliant report...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            This may take a few moments
          </p>
        </div>
      </div>
    );
  }

  // Preview/Report View
  if (showPreview && previewData) {
    const { ai_suggestions, form_data } = previewData;

    return (
      <div className="grid gap-5 lg:gap-7.5">
        {/* Success Message */}
        <div className="alert alert-success dark:bg-success/10">
          <div className="flex items-start gap-3">
            <KeenIcon icon="shield-tick" className="ki-outline text-2xl text-success dark:text-success-light" />
            <div className="flex flex-col gap-1">
              <span className="text-base font-semibold text-gray-900 dark:text-gray-100">{previewData.message}</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Review and edit the fields below as needed. All sections are editable.
              </span>
            </div>
          </div>
        </div>

        {/* AI Draft Summary */}
        {ai_suggestions?.draft_summary && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-2 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 dark:bg-blue-600">
                  <KeenIcon icon="abstract-26" className="ki-outline text-xl text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-bold text-blue-900 dark:text-blue-100">AI-Generated Draft Summary</h4>
                    <Badge variant="default" className="badge-sm">Auto-Generated</Badge>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    This summary was automatically generated based on the incident details you provided
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {ai_suggestions.draft_summary}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Suggestions Highlight Cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {/* Category Card */}
          <Card className="border-2 border-primary bg-primary-light/10 dark:bg-primary-dark/10">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">Suggested Category</p>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{ai_suggestions.category.value}</h3>
                </div>
                <Badge variant="default" className="badge-sm bg-success text-success-inverse">{ai_suggestions.category.confidence} confidence</Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <KeenIcon icon="information-2" className="ki-outline" />
                <span>AI-generated suggestion</span>
              </div>
            </CardContent>
          </Card>

          {/* Severity Card */}
          <Card className={`border-2 ${
            ai_suggestions.severity.value.toLowerCase() === 'low' ? 'border-success bg-success-light/10 dark:bg-success-dark/10' :
            ai_suggestions.severity.value.toLowerCase() === 'medium' ? 'border-warning bg-warning-light/10 dark:bg-warning-dark/10' :
            'border-danger bg-danger-light/10 dark:bg-danger-dark/10'
          }`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                    ai_suggestions.severity.value.toLowerCase() === 'low' ? 'text-success' :
                    ai_suggestions.severity.value.toLowerCase() === 'medium' ? 'text-warning' : 'text-danger'
                  }`}>Suggested Severity</p>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{ai_suggestions.severity.value}</h3>
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{ai_suggestions.severity.reason}</p>
            </CardContent>
          </Card>

          {/* Contributing Factors Card */}
          <Card className="border-2 border-info bg-info-light/10 dark:bg-info-dark/10">
            <CardContent className="p-5">
              <p className="text-xs font-semibold text-info uppercase tracking-wide mb-2">Key Contributing Factors</p>
              <ul className="space-y-1">
                {ai_suggestions.contributing_factors.map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <KeenIcon icon="check" className="ki-outline text-info mt-0.5" />
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* AI Disclaimer */}
        <div className="alert alert-warning dark:bg-warning/10">
          <div className="flex items-start gap-3">
            <KeenIcon icon="information-3" className="ki-outline text-lg text-warning dark:text-warning-light" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{ai_suggestions.disclaimer}</span>
          </div>
        </div>

        {/* Tabbed Form - Theme Compliant Custom Tabs */}
        <Card>
          <CardHeader className="border-b-0 pb-0 mb-3.5">
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
                Follow-up
              </Button>
              <Button
                variant={activeTab === 'summary' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('summary')}
                className="gap-2"
              >
                <KeenIcon icon="document" className="ki-outline text-base" />
                Summary
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="grid gap-5">
                <div className="flex items-baseline flex-wrap gap-2.5">
                  <label className="form-label max-w-70 gap-1">
                    <KeenIcon icon="calendar" className="text-sm" />
                    Incident Date & Time <span className="text-danger">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="input flex-1 min-w-0"
                    value={form_data.basic_info.incident_date_time?.replace(' ', 'T') || ''}
                    onChange={(e) => updateFormData('basic_info', 'incident_date_time', e.target.value.replace('T', ' '))}
                  />
                </div>

                <div className="flex items-baseline flex-wrap gap-2.5">
                  <label className="form-label max-w-70 gap-1">
                    <KeenIcon icon="geolocation" className="text-sm" />
                    Location <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="input flex-1 min-w-0"
                    value={form_data.basic_info.location}
                    onChange={(e) => updateFormData('basic_info', 'location', e.target.value)}
                    placeholder="Enter incident location"
                  />
                </div>

                <div className="flex items-baseline flex-wrap gap-2.5">
                  <label className="form-label max-w-70 gap-1">
                    <KeenIcon icon="user" className="text-sm" />
                    Participant Name
                  </label>
                  <input
                    type="text"
                    className="input flex-1 min-w-0"
                    value={form_data.basic_info.participant_name || 'Not specified'}
                    disabled
                  />
                </div>

                <div className="flex items-baseline flex-wrap gap-2.5">
                  <label className="form-label max-w-70 gap-1">
                    <KeenIcon icon="category" className="text-sm" />
                    Incident Type
                  </label>
                  <select
                    className="input flex-1 min-w-0"
                    value={form_data.basic_info.incident_type_id || ''}
                    onChange={(e) => {
                      const selectedId = parseInt(e.target.value);
                      const selectedType = previewData?.incident_types?.find(type => type.id === selectedId);
                      if (selectedType) {
                        setPreviewData({
                          ...previewData!,
                          form_data: {
                            ...previewData!.form_data,
                            basic_info: {
                              ...previewData!.form_data.basic_info,
                              incident_type: selectedType.name,
                              incident_type_id: selectedType.id
                            }
                          }
                        });
                      }
                    }}
                  >
                    <option value="">Select Incident Type</option>
                    {previewData?.incident_types?.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-baseline flex-wrap gap-2.5">
                  <label className="form-label max-w-70 gap-1">
                    <KeenIcon icon="chart" className="text-sm" />
                    Severity Level
                  </label>
                  <select
                    className="input flex-1 min-w-0"
                    value={form_data.basic_info.severity}
                    onChange={(e) => updateFormData('basic_info', 'severity', e.target.value)}
                  >
                    <option>Minor</option>
                    <option>Moderate</option>
                    <option>Serious</option>
                    <option>Critical</option>
                  </select>
                </div>

                <div className="flex items-start flex-wrap gap-2.5">
                  <label className="form-label max-w-70 gap-1 mt-2.5">
                    <KeenIcon icon="note-2" className="text-sm" />
                    Incident Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="input flex-1 min-w-0 min-h-[150px] resize-y p-3"
                    value={form_data.basic_info.description}
                    onChange={(e) => updateFormData('basic_info', 'description', e.target.value)}
                    placeholder="Provide detailed description of the incident..."
                  />
                </div>
              </div>
            )}

            {/* NDIS Details Tab */}
            {activeTab === 'ndis' && (
              <div className="grid gap-5">
                <div className="flex items-start flex-wrap gap-2.5">
                  <label className="form-label max-w-70 gap-1 mt-2.5">
                    <KeenIcon icon="shield-tick" className="text-sm" />
                    What Happened (Observable Facts)
                  </label>
                  <textarea
                    className="input flex-1 min-w-0 min-h-[100px] resize-y p-3"
                    value={form_data.ndis_details.what_happened}
                    onChange={(e) => updateFormData('ndis_details', 'what_happened', e.target.value)}
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
                    value={form_data.ndis_details.lead_up_triggers}
                    onChange={(e) => updateFormData('ndis_details', 'lead_up_triggers', e.target.value)}
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
                    value={form_data.ndis_details.during_incident}
                    onChange={(e) => updateFormData('ndis_details', 'during_incident', e.target.value)}
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
                    value={form_data.ndis_details.response_actions}
                    onChange={(e) => updateFormData('ndis_details', 'response_actions', e.target.value)}
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
                    value={form_data.ndis_details.causes_contributing_factors}
                    onChange={(e) => updateFormData('ndis_details', 'causes_contributing_factors', e.target.value)}
                    placeholder="Root causes and factors..."
                  />
                </div>
              </div>
            )}

            {/* Medical & Reporting Tab */}
            {activeTab === 'medical' && (
              <div className="grid gap-5">
                <Card className="bg-gray-50 dark:bg-gray-900">
                  <CardContent>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Medical Information</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={form_data.medical.injury_occurred}
                          onChange={(e) => updateFormData('medical', 'injury_occurred', e.target.checked)}
                        />
                        <label className="form-label mb-0">Injury Occurred</label>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={form_data.medical.medical_treatment_required}
                          onChange={(e) => updateFormData('medical', 'medical_treatment_required', e.target.checked)}
                        />
                        <label className="form-label mb-0">Medical Treatment Required</label>
                      </div>
                    </div>

                    {form_data.medical.injury_occurred && (
                      <div className="flex flex-col gap-2 mt-4">
                        <label className="form-label">Injury Details</label>
                        <textarea
                          className="input min-h-[100px] resize-y p-3"
                          value={form_data.medical.injury_details}
                          onChange={(e) => updateFormData('medical', 'injury_details', e.target.value)}
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
                          checked={form_data.reporting.is_ndis_reportable}
                          onChange={(e) => updateFormData('reporting', 'is_ndis_reportable', e.target.checked)}
                        />
                        <label className="form-label mb-0">NDIS Reportable</label>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={form_data.reporting.police_notified}
                          onChange={(e) => updateFormData('reporting', 'police_notified', e.target.checked)}
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
              <div className="grid gap-5">
                <div className="flex items-start flex-wrap gap-2.5">
                  <label className="form-label max-w-70 gap-1 mt-2.5">
                    <KeenIcon icon="note-2" className="text-sm" />
                    BSP Alignment Notes
                  </label>
                  <textarea
                    className="input flex-1 min-w-0 min-h-[120px] resize-y p-3"
                    value={form_data.bsp_analysis.bsp_alignment_notes}
                    onChange={(e) => updateFormData('bsp_analysis', 'bsp_alignment_notes', e.target.value)}
                    placeholder="How does this incident align with the participant's BSP..."
                  />
                </div>

                <div className="flex items-start flex-wrap gap-2.5">
                  <label className="form-label max-w-70 gap-1 mt-2.5">
                    <KeenIcon icon="rocket" className="text-sm" />
                    Suggested Improvements
                  </label>
                  <textarea
                    className="input flex-1 min-w-0 min-h-[120px] resize-y p-3"
                    value={form_data.bsp_analysis.bsp_suggested_improvements}
                    onChange={(e) => updateFormData('bsp_analysis', 'bsp_suggested_improvements', e.target.value)}
                    placeholder="Recommendations for BSP updates..."
                  />
                </div>
              </div>
            )}

            {/* Follow-up Tab */}
            {activeTab === 'followup' && (
              <div className="grid gap-5">
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={form_data.follow_up.follow_up_required}
                    onChange={(e) => updateFormData('follow_up', 'follow_up_required', e.target.checked)}
                  />
                  <label className="form-label mb-0 font-semibold">Follow-up Required</label>
                </div>

                {form_data.follow_up.follow_up_required && (
                  <div className="flex items-start flex-wrap gap-2.5">
                    <label className="form-label max-w-70 gap-1 mt-2.5">
                      <KeenIcon icon="route" className="text-sm" />
                      Follow-up Actions
                    </label>
                    <textarea
                      className="input flex-1 min-w-0 min-h-[150px] resize-y p-3"
                      value={form_data.follow_up.follow_up_actions}
                      onChange={(e) => updateFormData('follow_up', 'follow_up_actions', e.target.value)}
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
                    value={form_data.additional.additional_information}
                    onChange={(e) => updateFormData('additional', 'additional_information', e.target.value)}
                    placeholder="Any other relevant information..."
                  />
                </div>
              </div>
            )}

            {/* Summary Tab */}
            {activeTab === 'summary' && (
              <div className="grid gap-5">
                <div className="alert alert-info dark:bg-info/10">
                  <div className="flex items-start gap-3">
                    <KeenIcon icon="information-2" className="ki-outline text-lg text-info dark:text-info-light" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      This is the AI-generated comprehensive report summary. You can review all sections using the tabs above before submitting.
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">AI-Generated Report</h4>
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {previewData.generated_report}
                    </pre>
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
            onClick={() => setShowPreview(false)}
            disabled={isSubmitting}
          >
            <KeenIcon icon="left" className="ki-outline text-base" />
            Edit Narrative
          </Button>
          <div className="flex gap-3">
            <Button
              variant="light"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              <KeenIcon icon="cross" className="ki-outline text-base" />
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSubmitReport}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <KeenIcon icon="check" className="ki-outline text-base" />
                  Submit Report
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Initial Input Form
  return (
    <div className="grid gap-5 lg:gap-7.5">
      {/* Info Notice */}
      <div className="alert alert-info dark:bg-info/10">
        <div className="flex items-start gap-3">
          <KeenIcon icon="information-2" className="ki-outline text-lg text-info dark:text-info-light" />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Enhanced NDIS Extraction</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Integrates participant profile and Behaviour Support Plan (BSP) for compliant, structured incident reports with factual, observable language.
            </span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger dark:bg-danger/10">
          <div className="flex items-start gap-3">
            <KeenIcon icon="information" className="ki-outline text-lg text-danger dark:text-danger-light" />
            <span className="text-sm text-gray-900 dark:text-gray-100">{error}</span>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <h3 className="card-title">Incident Details</h3>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5">
            {/* Participant Dropdown */}
            <div className="flex items-baseline flex-wrap gap-2.5">
              <label className="form-label max-w-70 gap-1">
                <KeenIcon icon="user" className="text-sm" />
                Participant
                <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">(Optional)</span>
              </label>
              <select
                className="input flex-1 min-w-0"
                value={selectedParticipant}
                onChange={(e) => setSelectedParticipant(e.target.value)}
                disabled={isLoadingCustomers || isLoading}
              >
                <option value="">
                  {isLoadingCustomers ? 'Loading participants...' : 'Select a participant'}
                </option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.first_name} {customer.last_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Incident Narrative Field */}
            <div className="flex items-start flex-wrap gap-2.5">
              <label className="form-label max-w-70 gap-1 mt-2.5">
                <KeenIcon icon="note-2" className="text-sm" />
                Incident Narrative
                <span className="text-danger">*</span>
              </label>
              <textarea
                className="input flex-1 min-w-0 min-h-[200px] resize-y p-3"
                placeholder="Describe what happened:&#10;- What you observed (observable behaviours only)&#10;- What led up to the incident (triggers, antecedents)&#10;- What happened during the incident&#10;- How staff responded&#10;- Any injuries or damage&#10;&#10;The AI will extract structured, NDIS-compliant sections from your narrative."
                value={incidentNarrative}
                onChange={(e) => setIncidentNarrative(e.target.value)}
                rows={8}
                disabled={isLoading}
              />
            </div>

            {/* AI Extract Button */}
            <div className="flex justify-end">
              <Button
                variant="default"
                onClick={handleExtractFields}
                disabled={!incidentNarrative.trim() || isLoading}
              >
                <KeenIcon icon="ai" className="ki-outline text-base" />
                Extract NDIS-Compliant Fields with AI
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between gap-4">
        <Button
          variant="light"
          onClick={handleBack}
          disabled={isLoading}
        >
          <KeenIcon icon="left" className="ki-outline text-base" />
          Back to Incidents
        </Button>
      </div>
    </div>
  );
};

export { AddIncidentContent };
