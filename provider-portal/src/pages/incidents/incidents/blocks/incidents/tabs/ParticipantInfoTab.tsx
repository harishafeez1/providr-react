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
          <span className={`badge ${participantDetails.status === 'active' || participantDetails.status === true ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.6875rem', padding: '4px 10px' }}>
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
                        {participantDetails.first_name} {participantDetails.last_name}
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
                      <p style={{ fontSize: '0.8125rem', color: '#111827', fontWeight: '500', margin: 0 }}>
                        {participantDetails.contact_email || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Phone</p>
                      <p style={{ fontSize: '0.8125rem', color: '#111827', fontWeight: '500', margin: 0 }}>
                        {participantDetails.contact_phone || 'N/A'}
                      </p>
                    </div>
                    {participantDetails.assigned_practitioner && (
                      <div>
                        <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Assigned Provider</p>
                        <p style={{ fontSize: '0.8125rem', color: '#111827', fontWeight: '500', margin: 0 }}>
                          {participantDetails.assigned_practitioner.first_name} {participantDetails.assigned_practitioner.last_name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              {(participantDetails.medical_conditions || participantDetails.medications || participantDetails.disabilities) && (
                <div style={{ marginTop: '16px' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b46c1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Medical Information</p>
                  <div className="grid md:grid-cols-3 gap-3">
                    {participantDetails.medical_conditions && (
                      <div>
                        <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Medical Conditions</p>
                        <p style={{ fontSize: '0.75rem', color: '#374151', lineHeight: '1.4', margin: 0 }}>
                          {participantDetails.medical_conditions}
                        </p>
                      </div>
                    )}
                    {participantDetails.medications && (
                      <div>
                        <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Medications</p>
                        <p style={{ fontSize: '0.75rem', color: '#374151', lineHeight: '1.4', margin: 0 }}>
                          {participantDetails.medications}
                        </p>
                      </div>
                    )}
                    {participantDetails.disabilities && (
                      <div>
                        <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Disabilities</p>
                        <p style={{ fontSize: '0.75rem', color: '#374151', lineHeight: '1.4', margin: 0 }}>
                          {participantDetails.disabilities}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Behaviour Profile */}
          {(participantDetails.behaviours_of_concern || participantDetails.triggers_antecedents ||
            participantDetails.early_warning_signs || participantDetails.escalation_patterns ||
            participantDetails.behaviour_overview_summary || participantDetails.behavioural_tendencies) && (
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
                  {participantDetails.behaviours_of_concern && (
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Behaviours of Concern</p>
                      <p style={{ fontSize: '0.75rem', color: '#374151', lineHeight: '1.4', whiteSpace: 'pre-wrap', margin: 0 }}>
                        {participantDetails.behaviours_of_concern}
                      </p>
                    </div>
                  )}
                  {participantDetails.triggers_antecedents && (
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Triggers & Antecedents</p>
                      <p style={{ fontSize: '0.75rem', color: '#374151', lineHeight: '1.4', whiteSpace: 'pre-wrap', margin: 0 }}>
                        {participantDetails.triggers_antecedents}
                      </p>
                    </div>
                  )}
                  {participantDetails.early_warning_signs && (
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Early Warning Signs</p>
                      <p style={{ fontSize: '0.75rem', color: '#374151', lineHeight: '1.4', whiteSpace: 'pre-wrap', margin: 0 }}>
                        {participantDetails.early_warning_signs}
                      </p>
                    </div>
                  )}
                  {participantDetails.escalation_patterns && (
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Escalation Patterns</p>
                      <p style={{ fontSize: '0.75rem', color: '#374151', lineHeight: '1.4', whiteSpace: 'pre-wrap', margin: 0 }}>
                        {participantDetails.escalation_patterns}
                      </p>
                    </div>
                  )}
                  {participantDetails.behaviour_overview_summary && (
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Behaviour Overview</p>
                      <p style={{ fontSize: '0.75rem', color: '#374151', lineHeight: '1.4', whiteSpace: 'pre-wrap', margin: 0 }}>
                        {participantDetails.behaviour_overview_summary}
                      </p>
                    </div>
                  )}
                  {participantDetails.behavioural_tendencies && (
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Behavioural Tendencies</p>
                      <p style={{ fontSize: '0.75rem', color: '#374151', lineHeight: '1.4', whiteSpace: 'pre-wrap', margin: 0 }}>
                        {participantDetails.behavioural_tendencies}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* BSP Strategies */}
          {(participantDetails.proactive_strategies || participantDetails.reactive_strategies ||
            participantDetails.escalation_steps || participantDetails.restricted_practices ||
            participantDetails.support_requirements || participantDetails.risk_indicators ||
            participantDetails.risk_factors) && (
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
                  {participantDetails.proactive_strategies && (
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Proactive Strategies</p>
                      <p style={{ fontSize: '0.75rem', color: '#374151', lineHeight: '1.4', whiteSpace: 'pre-wrap', margin: 0 }}>
                        {participantDetails.proactive_strategies}
                      </p>
                    </div>
                  )}
                  {participantDetails.reactive_strategies && (
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Reactive Strategies</p>
                      <p style={{ fontSize: '0.75rem', color: '#374151', lineHeight: '1.4', whiteSpace: 'pre-wrap', margin: 0 }}>
                        {participantDetails.reactive_strategies}
                      </p>
                    </div>
                  )}
                  {participantDetails.escalation_steps && (
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Escalation Steps</p>
                      <p style={{ fontSize: '0.75rem', color: '#374151', lineHeight: '1.4', whiteSpace: 'pre-wrap', margin: 0 }}>
                        {participantDetails.escalation_steps}
                      </p>
                    </div>
                  )}
                  {participantDetails.restricted_practices && (
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Restricted Practices</p>
                      <p style={{ fontSize: '0.75rem', color: '#374151', lineHeight: '1.4', whiteSpace: 'pre-wrap', margin: 0 }}>
                        {participantDetails.restricted_practices}
                      </p>
                    </div>
                  )}
                  {participantDetails.support_requirements && (
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Support Requirements</p>
                      <p style={{ fontSize: '0.75rem', color: '#374151', lineHeight: '1.4', whiteSpace: 'pre-wrap', margin: 0 }}>
                        {participantDetails.support_requirements}
                      </p>
                    </div>
                  )}
                  {participantDetails.risk_indicators && (
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Risk Indicators</p>
                      <p style={{ fontSize: '0.75rem', color: '#374151', lineHeight: '1.4', whiteSpace: 'pre-wrap', margin: 0 }}>
                        {participantDetails.risk_indicators}
                      </p>
                    </div>
                  )}
                  {participantDetails.risk_factors && (
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Risk Factors</p>
                      <p style={{ fontSize: '0.75rem', color: '#374151', lineHeight: '1.4', whiteSpace: 'pre-wrap', margin: 0 }}>
                        {participantDetails.risk_factors}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Support Context */}
          {(participantDetails.sensory_profile || participantDetails.communication_style ||
            participantDetails.environmental_needs || participantDetails.support_environment_family_context ||
            participantDetails.functional_daily_living_profile) && (
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
                  {participantDetails.sensory_profile && (
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Sensory Profile</p>
                      <p style={{ fontSize: '0.75rem', color: '#374151', lineHeight: '1.4', whiteSpace: 'pre-wrap', margin: 0 }}>
                        {participantDetails.sensory_profile}
                      </p>
                    </div>
                  )}
                  {participantDetails.communication_style && (
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Communication Style</p>
                      <p style={{ fontSize: '0.75rem', color: '#374151', lineHeight: '1.4', whiteSpace: 'pre-wrap', margin: 0 }}>
                        {participantDetails.communication_style}
                      </p>
                    </div>
                  )}
                  {participantDetails.environmental_needs && (
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Environmental Needs</p>
                      <p style={{ fontSize: '0.75rem', color: '#374151', lineHeight: '1.4', whiteSpace: 'pre-wrap', margin: 0 }}>
                        {participantDetails.environmental_needs}
                      </p>
                    </div>
                  )}
                  {participantDetails.support_environment_family_context && (
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Support Environment / Family Context</p>
                      <p style={{ fontSize: '0.75rem', color: '#374151', lineHeight: '1.4', whiteSpace: 'pre-wrap', margin: 0 }}>
                        {participantDetails.support_environment_family_context}
                      </p>
                    </div>
                  )}
                  {participantDetails.functional_daily_living_profile && (
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Functional & Daily Living</p>
                      <p style={{ fontSize: '0.75rem', color: '#374151', lineHeight: '1.4', whiteSpace: 'pre-wrap', margin: 0 }}>
                        {participantDetails.functional_daily_living_profile}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
