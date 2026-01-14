import React from 'react';

interface ParticipantInfoTabProps {
  participantDetails: any;
}

export const ParticipantInfoTab: React.FC<ParticipantInfoTabProps> = ({
  participantDetails
}) => {
  if (!participantDetails) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          padding: '40px 20px'
        }}
      >
        <i
          className="ki-outline ki-profile-circle"
          style={{ fontSize: '64px', color: '#d1d5db', marginBottom: '16px' }}
        ></i>
        <p style={{ fontSize: '1rem', color: '#6b7280', textAlign: 'center', marginBottom: '8px' }}>
          No participant information available
        </p>
        <p style={{ fontSize: '0.875rem', color: '#9ca3af', textAlign: 'center' }}>
          This incident may not have an associated participant
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatGender = (gender: string) => {
    if (gender === 'male') return 'Male';
    if (gender === 'female') return 'Female';
    if (gender === 'other') return 'Other';
    if (gender === 'prefer_not_to_say') return 'Prefer Not To Say';
    return 'N/A';
  };

  // Helper component to display fields with empty state
  const InfoField = ({ label, value }: { label: string; value: string | undefined | null }) => {
    const hasValue = value && value.trim() !== '';
    return (
      <div>
        <p style={{
          fontSize: '0.6875rem',
          color: '#6b7280',
          marginBottom: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontWeight: '600'
        }}>
          {label}
        </p>
        <p style={{
          fontSize: '0.75rem',
          color: hasValue ? '#374151' : '#9ca3af',
          lineHeight: '1.4',
          whiteSpace: 'pre-wrap',
          margin: 0,
          fontStyle: hasValue ? 'normal' : 'italic'
        }}>
          {hasValue ? value : 'Not provided'}
        </p>
      </div>
    );
  };

  return (
    <div style={{
      animation: 'fadeIn 0.3s ease-in-out',
      padding: '0'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderLeft: '4px solid #6b46c1',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', justifyContent: 'space-between' }}>
          <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#6b46c1', margin: 0 }}>
            Participant Information
          </h4>
          <span className={`badge ${participantDetails.status === 'active' || participantDetails.status === true ? 'badge-success' : 'badge-danger'} badge-outline rounded-full`} style={{ fontSize: '0.6875rem', padding: '4px 10px' }}>
            {participantDetails.status === 'active' || participantDetails.status === true ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Core Participant Information */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e9d5ff',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '8px'
          }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                backgroundColor: '#f5f3ff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="ki-outline ki-profile-circle" style={{ fontSize: '18px', color: '#6b46c1' }}></i>
                <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', margin: 0 }}>
                  Core Participant Information
                </h5>
              </div>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#f5f3ff' }}>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Personal Profile */}
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b46c1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Personal Profile</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Full Name</p>
                      <p style={{ fontSize: '0.8125rem', color: '#111827', fontWeight: '500', margin: 0 }}>
                        {participantDetails.first_name && participantDetails.last_name
                          ? `${participantDetails.first_name} ${participantDetails.last_name}`
                          : participantDetails.first_name || participantDetails.last_name || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Date of Birth</p>
                      <p style={{ fontSize: '0.8125rem', color: '#111827', fontWeight: '500', margin: 0 }}>
                        {formatDate(participantDetails.dob)}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Gender</p>
                      <p style={{ fontSize: '0.8125rem', color: '#111827', fontWeight: '500', margin: 0 }}>
                        {formatGender(participantDetails.gender)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact & Provider Info */}
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b46c1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact & Provider Info</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Email</p>
                      <p style={{ fontSize: '0.8125rem', color: participantDetails.contact_email ? '#111827' : '#9ca3af', fontWeight: '500', margin: 0, fontStyle: participantDetails.contact_email ? 'normal' : 'italic' }}>
                        {participantDetails.contact_email || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Phone</p>
                      <p style={{ fontSize: '0.8125rem', color: participantDetails.contact_phone ? '#111827' : '#9ca3af', fontWeight: '500', margin: 0, fontStyle: participantDetails.contact_phone ? 'normal' : 'italic' }}>
                        {participantDetails.contact_phone || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Assigned Provider</p>
                      <p style={{ fontSize: '0.8125rem', color: participantDetails.assigned_practitioner ? '#111827' : '#9ca3af', fontWeight: '500', margin: 0, fontStyle: participantDetails.assigned_practitioner ? 'normal' : 'italic' }}>
                        {participantDetails.assigned_practitioner
                          ? `${participantDetails.assigned_practitioner.first_name || ''} ${participantDetails.assigned_practitioner.last_name || ''}`.trim() || participantDetails.assigned_practitioner.email || 'Unknown Practitioner'
                          : 'Not assigned'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Information - Always show */}
              <div style={{ marginTop: '16px' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b46c1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Medical Information</p>
                <div className="grid md:grid-cols-3 gap-3">
                  <InfoField label="Medical Conditions" value={participantDetails.medical_conditions} />
                  <InfoField label="Medications" value={participantDetails.medications} />
                  <InfoField label="Disabilities" value={participantDetails.disabilities} />
                </div>
              </div>
            </div>
          </div>

          {/* Behaviour Profile - Always show */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e9d5ff',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '8px'
          }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '14px 16px',
                backgroundColor: '#fff7ed'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="ki-outline ki-chart-line-star" style={{ fontSize: '18px', color: '#f97316' }}></i>
                <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', margin: 0 }}>
                  Behaviour Profile
                </h5>
              </div>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#fff7ed' }}>
              <div className="grid md:grid-cols-2 gap-3">
                <InfoField label="Behaviours of Concern" value={participantDetails.behaviours_of_concern} />
                <InfoField label="Triggers & Antecedents" value={participantDetails.triggers_antecedents} />
                <InfoField label="Early Warning Signs" value={participantDetails.early_warning_signs} />
                <InfoField label="Escalation Patterns" value={participantDetails.escalation_patterns} />
                <InfoField label="Behaviour Overview" value={participantDetails.behaviour_overview_summary} />
                <InfoField label="Behavioural Tendencies" value={participantDetails.behavioural_tendencies} />
              </div>
            </div>
          </div>

          {/* BSP Strategies - Always show */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e9d5ff',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '8px'
          }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '14px 16px',
                backgroundColor: '#f0fdf4'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="ki-outline ki-shield-tick" style={{ fontSize: '18px', color: '#22c55e' }}></i>
                <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', margin: 0 }}>
                  BSP Strategies
                </h5>
              </div>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#f0fdf4' }}>
              <div className="grid md:grid-cols-2 gap-3">
                <InfoField label="Proactive Strategies" value={participantDetails.proactive_strategies} />
                <InfoField label="Reactive Strategies" value={participantDetails.reactive_strategies} />
                <InfoField label="Escalation Steps" value={participantDetails.escalation_steps} />
                <InfoField label="Restricted Practices" value={participantDetails.restricted_practices} />
                <InfoField label="Support Requirements" value={participantDetails.support_requirements} />
                <InfoField label="Risk Indicators" value={participantDetails.risk_indicators} />
                <InfoField label="Risk Factors" value={participantDetails.risk_factors} />
              </div>
            </div>
          </div>

          {/* Support Context - Always show */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e9d5ff',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '8px'
          }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '14px 16px',
                backgroundColor: '#eff6ff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="ki-outline ki-home-2" style={{ fontSize: '18px', color: '#3b82f6' }}></i>
                <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', margin: 0 }}>
                  Support Context
                </h5>
              </div>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#eff6ff' }}>
              <div className="grid md:grid-cols-2 gap-3">
                <InfoField label="Sensory Profile" value={participantDetails.sensory_profile} />
                <InfoField label="Communication Style" value={participantDetails.communication_style} />
                <InfoField label="Environmental Needs" value={participantDetails.environmental_needs} />
                <InfoField label="Support Environment / Family Context" value={participantDetails.support_environment_family_context} />
                <InfoField label="Functional & Daily Living" value={participantDetails.functional_daily_living_profile} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};