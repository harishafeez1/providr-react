import React, { useState } from 'react';
import { IParticipantsData } from './ParticipantsData';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components';
import { Card, CardContent } from '@/components/ui/card';

interface ParticipantDetailsModalProps {
  showModal: boolean;
  onClose: () => void;
  participant: IParticipantsData | null;
}

export const ParticipantDetailsModal: React.FC<ParticipantDetailsModalProps> = ({
  showModal,
  onClose,
  participant
}) => {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    basic: true,
    behaviour: false,
    bsp: false,
    support: false
  });

  if (!showModal || !participant) return null;

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

  const formatStatus = (status: string | number | boolean) => {
    return status === 'active' || status === true ? 'Active' : 'Inactive';
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const InfoField = ({ label, value }: { label: string; value: string | undefined }) => {
    return (
      <div className="flex flex-col gap-2">
        <label className="form-label text-sm font-semibold text-gray-700">{label}</label>
        <div className={`p-3 rounded-lg border ${
          value
            ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
            : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
        }`}>
          <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
            value
              ? 'text-gray-800 dark:text-gray-200'
              : 'text-gray-500 dark:text-gray-400 italic'
          }`}>
            {value || 'Not provided'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={showModal} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Participant Details</DialogTitle>
            {participant && (
              <span className={`badge ${
                participant.status === 'active' || participant.status === true
                  ? 'badge-success'
                  : 'badge-danger'
              } badge-outline rounded-full`}>
                {formatStatus(participant.status)}
              </span>
            )}
          </div>
        </DialogHeader>
        <DialogBody className="scrollable-y-auto max-h-[calc(90vh-100px)]">
          {!participant ? (
            <div className="flex flex-col items-center justify-center py-12">
              <KeenIcon icon="information-2" className="text-6xl text-gray-400 mb-4" />
              <p className="text-gray-600 text-center">No participant data available.</p>
            </div>
          ) : (
          <div className="grid gap-4">
            {/* Basic Information Section */}
            <Card className="border border-gray-200">
              <div
                className="card-header cursor-pointer flex items-center justify-between p-4 bg-primary-light hover:bg-primary-light/80 transition-colors"
                onClick={() => toggleSection('basic')}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-light">
                    <KeenIcon icon="user" className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Basic Information</h3>
                    <p className="text-xs text-gray-600">Personal details and contact information</p>
                  </div>
                </div>
                <KeenIcon icon={expandedSections.basic ? 'up' : 'down'} className="text-gray-600" />
              </div>
              {expandedSections.basic && (
                <CardContent className="p-4 grid gap-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">First Name</p>
                      <p className="text-sm font-semibold text-gray-900">{participant.first_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Last Name</p>
                      <p className="text-sm font-semibold text-gray-900">{participant.last_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Date of Birth</p>
                      <p className="text-sm text-gray-900">{formatDate(participant.dob)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Gender</p>
                      <p className="text-sm text-gray-900">{formatGender(participant.gender)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Contact Email</p>
                      <p className="text-sm text-gray-900">{participant.contact_email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Contact Phone</p>
                      <p className="text-sm text-gray-900">{participant.contact_phone || 'N/A'}</p>
                    </div>
                  </div>

                  {participant.assigned_practitioner ? (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-3">
                        <KeenIcon icon="user" className="text-blue-600" />
                        <h4 className="text-sm font-semibold text-gray-900">Assigned Practitioner</h4>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Provider Name</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {participant.assigned_practitioner.first_name && participant.assigned_practitioner.last_name
                              ? `${participant.assigned_practitioner.first_name} ${participant.assigned_practitioner.last_name}`
                              : participant.assigned_practitioner.email || 'Unknown Practitioner'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Provider Email</p>
                          <p className="text-sm text-gray-900">
                            {participant.assigned_practitioner.email || 'Not provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <KeenIcon icon="user" className="text-gray-400" />
                        <p className="text-sm text-gray-600">No practitioner assigned</p>
                      </div>
                    </div>
                  )}

                  <InfoField label="Medical Conditions" value={participant.medical_conditions} />
                  <InfoField label="Medications" value={participant.medications} />
                  <InfoField label="Disabilities" value={participant.disabilities} />
                </CardContent>
              )}
            </Card>

            {/* Behaviour Profile Section */}
            <Card className="border border-gray-200">
              <div
                className="card-header cursor-pointer flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('behaviour')}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-danger-light">
                    <KeenIcon icon="chart-line-star" className="text-danger" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Behaviour Profile</h3>
                    <p className="text-xs text-gray-600">Behaviours, triggers, and escalation patterns</p>
                  </div>
                </div>
                <KeenIcon icon={expandedSections.behaviour ? 'up' : 'down'} className="text-gray-600" />
              </div>
              {expandedSections.behaviour && (
                <CardContent className="p-4 grid gap-4">
                  <InfoField label="Behaviours of Concern" value={participant.behaviours_of_concern} />
                  <InfoField label="Triggers & Antecedents" value={participant.triggers_antecedents} />
                  <InfoField label="Early Warning Signs" value={participant.early_warning_signs} />
                  <InfoField label="Escalation Patterns" value={participant.escalation_patterns} />
                  <InfoField label="Behaviour Overview Summary" value={participant.behaviour_overview_summary} />
                  <InfoField label="Behavioural Tendencies (Legacy)" value={participant.behavioural_tendencies} />
                </CardContent>
              )}
            </Card>

            {/* BSP Strategies Section */}
            <Card className="border border-gray-200">
              <div
                className="card-header cursor-pointer flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('bsp')}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success-light">
                    <KeenIcon icon="shield-tick" className="text-success" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">BSP Strategies</h3>
                    <p className="text-xs text-gray-600">Proactive, reactive, and support protocols</p>
                  </div>
                </div>
                <KeenIcon icon={expandedSections.bsp ? 'up' : 'down'} className="text-gray-600" />
              </div>
              {expandedSections.bsp && (
                <CardContent className="p-4 grid gap-4">
                  <InfoField label="Proactive Strategies" value={participant.proactive_strategies} />
                  <InfoField label="Reactive Strategies" value={participant.reactive_strategies} />
                  <InfoField label="Escalation Steps" value={participant.escalation_steps} />
                  <InfoField label="Restricted Practices" value={participant.restricted_practices} />
                  <InfoField label="Support Requirements" value={participant.support_requirements} />
                  <InfoField label="Risk Indicators" value={participant.risk_indicators} />
                  <InfoField label="Risk Factors (Legacy)" value={participant.risk_factors} />
                </CardContent>
              )}
            </Card>

            {/* Support Context Section */}
            <Card className="border border-gray-200">
              <div
                className="card-header cursor-pointer flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('support')}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-warning-light">
                    <KeenIcon icon="home-2" className="text-warning" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Support Context</h3>
                    <p className="text-xs text-gray-600">Communication, sensory, and environmental needs</p>
                  </div>
                </div>
                <KeenIcon icon={expandedSections.support ? 'up' : 'down'} className="text-gray-600" />
              </div>
              {expandedSections.support && (
                <CardContent className="p-4 grid gap-4">
                  <InfoField label="Sensory Profile" value={participant.sensory_profile} />
                  <InfoField label="Communication Style" value={participant.communication_style} />
                  <InfoField label="Environmental Needs" value={participant.environmental_needs} />
                  <InfoField label="Support Environment / Family Context" value={participant.support_environment_family_context} />
                  <InfoField label="Functional & Daily Living Profile" value={participant.functional_daily_living_profile} />
                </CardContent>
              )}
            </Card>
          </div>
          )}
        </DialogBody>
        <div className="modal-footer p-4 border-t border-gray-200 flex justify-end">
          <Button variant="light" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};