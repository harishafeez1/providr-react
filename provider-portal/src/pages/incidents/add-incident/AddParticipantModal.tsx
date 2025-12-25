import { useEffect, useState } from 'react';
import { Formik, Form, useFormikContext, FormikProps } from 'formik';
import * as Yup from 'yup';
import { createParticipant, fetchIncidentCustomers } from '@/services/api';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthContext } from '@/auth';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components';

const participantSchema = Yup.object().shape({
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  dob: Yup.string().required('Date of birth is required'),
  gender: Yup.string().required('Gender is required'),
  status: Yup.boolean().required('Status is required'),
});

const FocusError = () => {
  const { errors, isSubmitting, isValidating } = useFormikContext();

  useEffect(() => {
    if (isSubmitting && !isValidating) {
      const keys = Object.keys(errors);
      if (keys.length > 0) {
        const selector = `[name="${keys[0]}"]`;
        const errorElement = document.querySelector(selector) as HTMLElement;
        if (errorElement) {
          errorElement.focus();
        }
      }
    }
  }, [errors, isSubmitting, isValidating]);

  return null;
};

interface AddParticipantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onParticipantAdded: (participant: any) => void;
}

const AddParticipantModal = ({ open, onOpenChange, onParticipantAdded }: AddParticipantModalProps) => {
  const { currentUser } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [practitioners, setPractitioners] = useState<any[]>([]);
  const [loadingPractitioners, setLoadingPractitioners] = useState(true);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    basic: true,
    behaviour: false,
    bsp: false,
    support: false
  });

  useEffect(() => {
    if (open) {
      fetchCustomers();
    }
  }, [open, currentUser?.provider_company_id]);

  const fetchCustomers = async () => {
    try {
      setLoadingPractitioners(true);
      const response = await fetchIncidentCustomers();
      if (response && response.customers) {
        setPractitioners(response.customers);
      } else if (response && response.data) {
        setPractitioners(response.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoadingPractitioners(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add New Participant</DialogTitle>
        </DialogHeader>
        <DialogBody className="scrollable-y-auto max-h-[calc(90vh-100px)]">
        <Formik
          initialValues={{
            first_name: '',
            last_name: '',
            dob: '',
            gender: '',
            contact_phone: '',
            contact_email: '',
            assigned_practitioner_id: '',
            assigned_worker_ids: [] as string[],
            status: true,
            medical_conditions: '',
            medications: '',
            disabilities: '',
            behaviours_of_concern: '',
            triggers_antecedents: '',
            early_warning_signs: '',
            escalation_patterns: '',
            behaviour_overview_summary: '',
            behavioural_tendencies: '',
            proactive_strategies: '',
            reactive_strategies: '',
            escalation_steps: '',
            restricted_practices: '',
            support_requirements: '',
            risk_indicators: '',
            risk_factors: '',
            sensory_profile: '',
            communication_style: '',
            environmental_needs: '',
            support_environment_family_context: '',
            functional_daily_living_profile: ''
          }}
          validationSchema={participantSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            setLoading(true);
            try {
              const formData = {
                ...values,
                assigned_practitioner_id: values.assigned_practitioner_id || null,
                status: values.status ? 'active' : 'inactive'
              };

              const response = await createParticipant(formData);
              const newParticipant = response.participant || response;

              // Pass the new participant back to parent
              onParticipantAdded({
                id: newParticipant.id,
                first_name: newParticipant.first_name,
                last_name: newParticipant.last_name,
                email: newParticipant.contact_email,
                phone: newParticipant.contact_phone
              });

              resetForm();
              onOpenChange(false);
            } catch (error) {
              console.error('Error creating participant:', error);
            } finally {
              setLoading(false);
              setSubmitting(false);
            }
          }}
        >
          {({ errors, touched, setFieldValue, values }: FormikProps<any>) => (
            <Form className="grid gap-4">
              <FocusError />

              {/* Basic Information Section */}
              <div className="card border border-gray-200">
                <div
                  className="card-header cursor-pointer flex items-center justify-between p-4 bg-primary-light"
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
                  <div className="card-body p-4 grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="form-label text-sm">First Name <span className="text-danger">*</span></label>
                        <Input
                          name="first_name"
                          value={values.first_name}
                          onChange={(e) => setFieldValue('first_name', e.target.value)}
                          placeholder="Enter first name"
                        />
                        {errors.first_name && touched.first_name && (
                          <span className="text-danger text-xs">{String(errors.first_name)}</span>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="form-label text-sm">Last Name <span className="text-danger">*</span></label>
                        <Input
                          name="last_name"
                          value={values.last_name}
                          onChange={(e) => setFieldValue('last_name', e.target.value)}
                          placeholder="Enter last name"
                        />
                        {errors.last_name && touched.last_name && (
                          <span className="text-danger text-xs">{String(errors.last_name)}</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="form-label text-sm">Date of Birth <span className="text-danger">*</span></label>
                        <Input
                          type="date"
                          name="dob"
                          value={values.dob}
                          onChange={(e) => setFieldValue('dob', e.target.value)}
                        />
                        {errors.dob && touched.dob && (
                          <span className="text-danger text-xs">{String(errors.dob)}</span>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="form-label text-sm">Gender <span className="text-danger">*</span></label>
                        <Select
                          value={values.gender}
                          onValueChange={(value) => setFieldValue('gender', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.gender && touched.gender && (
                          <span className="text-danger text-xs">{String(errors.gender)}</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="form-label text-sm">Contact Phone</label>
                        <Input
                          type="tel"
                          name="contact_phone"
                          value={values.contact_phone}
                          onChange={(e) => setFieldValue('contact_phone', e.target.value)}
                          placeholder="Enter phone number"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="form-label text-sm">Contact Email</label>
                        <Input
                          type="email"
                          name="contact_email"
                          value={values.contact_email}
                          onChange={(e) => setFieldValue('contact_email', e.target.value)}
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="form-label text-sm">Assigned Practitioner</label>
                      <Select
                        value={values.assigned_practitioner_id || undefined}
                        onValueChange={(value) => setFieldValue('assigned_practitioner_id', value === 'none' ? '' : value)}
                        disabled={loadingPractitioners}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select practitioner (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {practitioners.map((practitioner) => (
                            <SelectItem key={practitioner.id} value={String(practitioner.id)}>
                              {practitioner.first_name} {practitioner.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="form-label text-sm">Status</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">{values.status ? 'Active' : 'Inactive'}</span>
                        <Switch
                          checked={values.status}
                          onCheckedChange={(checked) => setFieldValue('status', checked)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="form-label text-sm">Medical Conditions</label>
                      <Textarea
                        name="medical_conditions"
                        value={values.medical_conditions}
                        onChange={(e) => setFieldValue('medical_conditions', e.target.value)}
                        placeholder="Relevant medical conditions..."
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="form-label text-sm">Medications</label>
                      <Textarea
                        name="medications"
                        value={values.medications}
                        onChange={(e) => setFieldValue('medications', e.target.value)}
                        placeholder="Current medications..."
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="form-label text-sm">Disabilities</label>
                      <Textarea
                        name="disabilities"
                        value={values.disabilities}
                        onChange={(e) => setFieldValue('disabilities', e.target.value)}
                        placeholder="Documented disabilities for NDIS compliance..."
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Behaviour Profile Section */}
              <div className="card border border-gray-200">
                <div
                  className="card-header cursor-pointer flex items-center justify-between p-4"
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
                  <div className="card-body p-4 grid gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="form-label text-sm">Behaviours of Concern</label>
                      <Textarea
                        name="behaviours_of_concern"
                        value={values.behaviours_of_concern}
                        onChange={(e) => setFieldValue('behaviours_of_concern', e.target.value)}
                        placeholder="Types of behaviours (verbal aggression, physical aggression, self-injury), frequencies, intensities, topographies..."
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="form-label text-sm">Triggers & Antecedents</label>
                      <Textarea
                        name="triggers_antecedents"
                        value={values.triggers_antecedents}
                        onChange={(e) => setFieldValue('triggers_antecedents', e.target.value)}
                        placeholder="Environmental factors, social triggers, physiological triggers, situational triggers..."
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="form-label text-sm">Early Warning Signs</label>
                      <Textarea
                        name="early_warning_signs"
                        value={values.early_warning_signs}
                        onChange={(e) => setFieldValue('early_warning_signs', e.target.value)}
                        placeholder="Precursor behaviours: pacing, verbal changes, facial expressions, withdrawal, increased stimming..."
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="form-label text-sm">Escalation Patterns</label>
                      <Textarea
                        name="escalation_patterns"
                        value={values.escalation_patterns}
                        onChange={(e) => setFieldValue('escalation_patterns', e.target.value)}
                        placeholder="Duration of episodes, intensity progression, peak behaviours, de-escalation timeline, recovery period..."
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="form-label text-sm">Behaviour Overview Summary</label>
                      <Textarea
                        name="behaviour_overview_summary"
                        value={values.behaviour_overview_summary}
                        onChange={(e) => setFieldValue('behaviour_overview_summary', e.target.value)}
                        placeholder="High-level summary of all behaviours of concern including overall patterns and key concerns..."
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="form-label text-sm">Behavioural Tendencies (Legacy)</label>
                      <Textarea
                        name="behavioural_tendencies"
                        value={values.behavioural_tendencies}
                        onChange={(e) => setFieldValue('behavioural_tendencies', e.target.value)}
                        placeholder="Legacy field - common behavioural patterns..."
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* BSP Strategies Section */}
              <div className="card border border-gray-200">
                <div
                  className="card-header cursor-pointer flex items-center justify-between p-4"
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
                  <div className="card-body p-4 grid gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="form-label text-sm">Proactive Strategies</label>
                      <Textarea
                        name="proactive_strategies"
                        value={values.proactive_strategies}
                        onChange={(e) => setFieldValue('proactive_strategies', e.target.value)}
                        placeholder="Prevention strategies: environmental modifications, schedule strategies, communication supports, sensory accommodations..."
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="form-label text-sm">Reactive Strategies</label>
                      <Textarea
                        name="reactive_strategies"
                        value={values.reactive_strategies}
                        onChange={(e) => setFieldValue('reactive_strategies', e.target.value)}
                        placeholder="Response strategies: de-escalation techniques, staff protocols, verbal interventions, safety procedures..."
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="form-label text-sm">Escalation Steps</label>
                      <Textarea
                        name="escalation_steps"
                        value={values.escalation_steps}
                        onChange={(e) => setFieldValue('escalation_steps', e.target.value)}
                        placeholder="Step-by-step protocol: when to call supervisor, when to call emergency services, documentation requirements..."
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="form-label text-sm">Restricted Practices</label>
                      <Textarea
                        name="restricted_practices"
                        value={values.restricted_practices}
                        onChange={(e) => setFieldValue('restricted_practices', e.target.value)}
                        placeholder='Authorised/not authorised practices, conditions for use, reporting requirements. Write "None authorised" if none...'
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="form-label text-sm">Support Requirements</label>
                      <Textarea
                        name="support_requirements"
                        value={values.support_requirements}
                        onChange={(e) => setFieldValue('support_requirements', e.target.value)}
                        placeholder="Staffing ratios (1:1, 2:1), supervision levels, transition support, staff skill requirements..."
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="form-label text-sm">Risk Indicators</label>
                      <Textarea
                        name="risk_indicators"
                        value={values.risk_indicators}
                        onChange={(e) => setFieldValue('risk_indicators', e.target.value)}
                        placeholder="Risk levels: harm to self (low/medium/high), harm to others, flight risk, property damage risk..."
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="form-label text-sm">Risk Factors (Legacy)</label>
                      <Textarea
                        name="risk_factors"
                        value={values.risk_factors}
                        onChange={(e) => setFieldValue('risk_factors', e.target.value)}
                        placeholder="Legacy field - known risk factors..."
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Support Context Section */}
              <div className="card border border-gray-200">
                <div
                  className="card-header cursor-pointer flex items-center justify-between p-4"
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
                  <div className="card-body p-4 grid gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="form-label text-sm">Sensory Profile</label>
                      <Textarea
                        name="sensory_profile"
                        value={values.sensory_profile}
                        onChange={(e) => setFieldValue('sensory_profile', e.target.value)}
                        placeholder="Sensory sensitivities: noise, tactile, visual, proprioceptive needs, sensory seeking/avoiding behaviours..."
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="form-label text-sm">Communication Style</label>
                      <Textarea
                        name="communication_style"
                        value={values.communication_style}
                        onChange={(e) => setFieldValue('communication_style', e.target.value)}
                        placeholder="Receptive/expressive communication, processing time needed, preferred modalities, AAC needs..."
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="form-label text-sm">Environmental Needs</label>
                      <Textarea
                        name="environmental_needs"
                        value={values.environmental_needs}
                        onChange={(e) => setFieldValue('environmental_needs', e.target.value)}
                        placeholder="Lighting preferences, noise levels, space requirements, temperature, access to calming spaces..."
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="form-label text-sm">Support Environment / Family Context</label>
                      <Textarea
                        name="support_environment_family_context"
                        value={values.support_environment_family_context}
                        onChange={(e) => setFieldValue('support_environment_family_context', e.target.value)}
                        placeholder="Living situation, family/carer involvement, home environment, community access considerations..."
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="form-label text-sm">Functional & Daily Living Profile</label>
                      <Textarea
                        name="functional_daily_living_profile"
                        value={values.functional_daily_living_profile}
                        onChange={(e) => setFieldValue('functional_daily_living_profile', e.target.value)}
                        placeholder="Daily living skills, routines, functional limitations, mobility considerations, safety in daily activities..."
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <Button
                  type="button"
                  variant="light"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="default" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <KeenIcon icon="check" className="ki-outline text-base" />
                      Save Participant
                    </>
                  )}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { AddParticipantModal };
