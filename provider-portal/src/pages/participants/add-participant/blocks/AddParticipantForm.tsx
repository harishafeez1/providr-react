import { useEffect, useState } from 'react';
import { Formik, Form, useFormikContext, FormikProps } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router';
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
import { useAuthContext } from '@/auth';
import { KeenIcon } from '@/components';
import { DateTimePicker } from '@/components/ui/date-time-picker';

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

const AddParticipantForm = () => {
  const navigate = useNavigate();
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
    const fetchCustomers = async () => {
      if (!currentUser?.provider_company_id) return;

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

    fetchCustomers();
  }, [currentUser?.provider_company_id]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="grid gap-5">
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
        onSubmit={async (values, { setSubmitting }) => {
          setLoading(true);
          try {
            const formData = {
              ...values,
              assigned_practitioner_id: values.assigned_practitioner_id || null,
              status: values.status ? 'active' : 'inactive'
            };

            await createParticipant(formData);
            // Success toast is shown automatically by axios interceptor
            navigate('/participants');
          } catch (error) {
            console.error('Error creating participant:', error);
            // Error toast is shown automatically by axios interceptor
          } finally {
            setLoading(false);
            setSubmitting(false);
          }
        }}
      >
        {({ errors, touched, setFieldValue, values }: FormikProps<any>) => (
          <Form className="grid gap-5">
            <FocusError />

            {/* Basic Information Section */}
            <div className="card">
              <div
                className="card-header cursor-pointer flex items-center justify-between bg-primary-light"
                onClick={() => toggleSection('basic')}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-light">
                    <KeenIcon icon="user" className="text-primary text-lg" />
                  </div>
                  <div>
                    <h3 className="card-title">Basic Information</h3>
                    <p className="text-sm text-gray-700">Personal details and contact information</p>
                  </div>
                </div>
                <KeenIcon icon={expandedSections.basic ? 'up' : 'down'} className="text-gray-600" />
              </div>
              {expandedSections.basic && (
                <div className="card-body py-10 grid gap-5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="form-label max-w-56">Status</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">
                        {values.status ? 'Active' : 'Inactive'}
                      </span>
                      <Switch
                        checked={values.status}
                        onCheckedChange={(checked) => setFieldValue('status', checked)}
                      />
                    </div>
                  </div>

                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label max-w-56">
                      First Name <span className="text-danger">*</span>
                    </label>
                    <div className="flex flex-col w-full gap-2.5">
                      <Input
                        name="first_name"
                        value={values.first_name}
                        onChange={(e) => setFieldValue('first_name', e.target.value)}
                        placeholder="Enter first name"
                        className="input"
                      />
                      {errors.first_name && touched.first_name && (
                        <span className="text-danger text-xs">{String(errors.first_name)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label max-w-56">
                      Last Name <span className="text-danger">*</span>
                    </label>
                    <div className="flex flex-col w-full gap-2.5">
                      <Input
                        name="last_name"
                        value={values.last_name}
                        onChange={(e) => setFieldValue('last_name', e.target.value)}
                        placeholder="Enter last name"
                        className="input"
                      />
                      {errors.last_name && touched.last_name && (
                        <span className="text-danger text-xs">{String(errors.last_name)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label max-w-56">
                      Date of Birth <span className="text-danger">*</span>
                    </label>
                    <div className="flex flex-col w-full gap-2.5">
                      <DateTimePicker
                        mode="date"
                        value={values.dob}
                        onChange={(value) => setFieldValue('dob', value)}
                        placeholder="Select date of birth"
                        required
                      />
                      {errors.dob && touched.dob && (
                        <span className="text-danger text-xs">{String(errors.dob)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label max-w-56">
                      Gender <span className="text-danger">*</span>
                    </label>
                    <div className="flex flex-col w-full gap-2.5">
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

                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label max-w-56">Contact Phone</label>
                    <div className="flex flex-col w-full gap-2.5">
                      <Input
                        type="tel"
                        name="contact_phone"
                        value={values.contact_phone}
                        onChange={(e) => setFieldValue('contact_phone', e.target.value)}
                        placeholder="Enter phone number"
                        className="input"
                      />
                      {errors.contact_phone && touched.contact_phone && (
                        <span className="text-danger text-xs">{String(errors.contact_phone)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label max-w-56">Contact Email</label>
                    <div className="flex flex-col w-full gap-2.5">
                      <Input
                        type="email"
                        name="contact_email"
                        value={values.contact_email}
                        onChange={(e) => setFieldValue('contact_email', e.target.value)}
                        placeholder="Enter email address"
                        className="input"
                      />
                      {errors.contact_email && touched.contact_email && (
                        <span className="text-danger text-xs">{String(errors.contact_email)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label max-w-56">Assigned Practitioner</label>
                    <div className="flex flex-col w-full gap-2.5">
                      <Select
                        value={values.assigned_practitioner_id || undefined}
                        onValueChange={(value) => setFieldValue('assigned_practitioner_id', value === 'none' ? '' : value)}
                        disabled={loadingPractitioners}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={loadingPractitioners ? "Loading practitioners..." : "Select practitioner (optional)"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {practitioners.length === 0 && !loadingPractitioners ? (
                            <SelectItem value="no_practitioners" disabled>No practitioners available</SelectItem>
                          ) : (
                            practitioners.map((practitioner) => (
                              <SelectItem key={practitioner.id} value={String(practitioner.id)}>
                                {practitioner.first_name && practitioner.last_name
                                  ? `${practitioner.first_name} ${practitioner.last_name}`
                                  : practitioner.email || 'Unknown Practitioner'}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label max-w-56">Medical Conditions</label>
                    <div className="flex flex-col w-full gap-2.5">
                      <Textarea
                        name="medical_conditions"
                        value={values.medical_conditions}
                        onChange={(e) => setFieldValue('medical_conditions', e.target.value)}
                        placeholder="Relevant medical conditions..."
                        className="input min-h-[100px]"
                      />
                    </div>
                  </div>

                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label max-w-56">Medications</label>
                    <div className="flex flex-col w-full gap-2.5">
                      <Textarea
                        name="medications"
                        value={values.medications}
                        onChange={(e) => setFieldValue('medications', e.target.value)}
                        placeholder="Current medications..."
                        className="input min-h-[100px]"
                      />
                    </div>
                  </div>

                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label max-w-56">Disabilities</label>
                    <div className="flex flex-col w-full gap-2.5">
                      <Textarea
                        name="disabilities"
                        value={values.disabilities}
                        onChange={(e) => setFieldValue('disabilities', e.target.value)}
                        placeholder="Documented disabilities for NDIS compliance..."
                        className="input min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Behaviour Profile Section */}
            <div className="card">
              <div
                className="card-header cursor-pointer flex items-center justify-between bg-danger-light"
                onClick={() => toggleSection('behaviour')}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-danger-light">
                    <KeenIcon icon="chart-line-star" className="text-danger text-lg" />
                  </div>
                  <div>
                    <h3 className="card-title">Behaviour Profile</h3>
                    <p className="text-sm text-gray-700">Behaviours, triggers, and escalation patterns</p>
                  </div>
                </div>
                <KeenIcon icon={expandedSections.behaviour ? 'up' : 'down'} className="text-gray-600" />
              </div>
              {expandedSections.behaviour && (
                <div className="card-body py-10 grid gap-5">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label max-w-56">Behaviours of Concern</label>
                    <Textarea
                      name="behaviours_of_concern"
                      value={values.behaviours_of_concern}
                      onChange={(e) => setFieldValue('behaviours_of_concern', e.target.value)}
                      placeholder="Types of behaviours (verbal aggression, physical aggression, self-injury), frequencies, intensities, topographies..."
                      className="input min-h-[100px]"
                    />
                  </div>

                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label max-w-56">Triggers & Antecedents</label>
                    <Textarea
                      name="triggers_antecedents"
                      value={values.triggers_antecedents}
                      onChange={(e) => setFieldValue('triggers_antecedents', e.target.value)}
                      placeholder="Environmental factors, social triggers, physiological triggers, situational triggers..."
                      className="input min-h-[100px]"
                    />
                  </div>

                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label max-w-56">Early Warning Signs</label>
                    <Textarea
                      name="early_warning_signs"
                      value={values.early_warning_signs}
                      onChange={(e) => setFieldValue('early_warning_signs', e.target.value)}
                      placeholder="Precursor behaviours: pacing, verbal changes, facial expressions, withdrawal, increased stimming..."
                      className="input min-h-[100px]"
                    />
                  </div>

                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label max-w-56">Escalation Patterns</label>
                    <Textarea
                      name="escalation_patterns"
                      value={values.escalation_patterns}
                      onChange={(e) => setFieldValue('escalation_patterns', e.target.value)}
                      placeholder="Duration of episodes, intensity progression, peak behaviours, de-escalation timeline, recovery period..."
                      className="input min-h-[100px]"
                    />
                  </div>

                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label max-w-56">Behaviour Overview Summary</label>
                    <Textarea
                      name="behaviour_overview_summary"
                      value={values.behaviour_overview_summary}
                      onChange={(e) => setFieldValue('behaviour_overview_summary', e.target.value)}
                      placeholder="High-level summary of all behaviours of concern including overall patterns and key concerns..."
                      className="input min-h-[100px]"
                    />
                  </div>

                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label max-w-56">Behavioural Tendencies (Legacy)</label>
                    <Textarea
                      name="behavioural_tendencies"
                      value={values.behavioural_tendencies}
                      onChange={(e) => setFieldValue('behavioural_tendencies', e.target.value)}
                      placeholder="Legacy field - common behavioural patterns..."
                      className="input min-h-[100px]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* BSP Strategies Section */}
            <div className="card">
              <div
                className="card-header cursor-pointer flex items-center justify-between bg-success-light"
                onClick={() => toggleSection('bsp')}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-success-light">
                    <KeenIcon icon="shield-tick" className="text-success text-lg" />
                  </div>
                  <div>
                    <h3 className="card-title">BSP Strategies</h3>
                    <p className="text-sm text-gray-700">Proactive, reactive, and support protocols</p>
                  </div>
                </div>
                <KeenIcon icon={expandedSections.bsp ? 'up' : 'down'} className="text-gray-600" />
              </div>
              {expandedSections.bsp && (
                <div className="card-body py-10 grid gap-5">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label max-w-56">Proactive Strategies</label>
                    <Textarea
                      name="proactive_strategies"
                      value={values.proactive_strategies}
                      onChange={(e) => setFieldValue('proactive_strategies', e.target.value)}
                      placeholder="Prevention strategies: environmental modifications, schedule strategies, communication supports, sensory accommodations..."
                      className="input min-h-[100px]"
                    />
                  </div>

                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label max-w-56">Reactive Strategies</label>
                    <Textarea
                      name="reactive_strategies"
                      value={values.reactive_strategies}
                      onChange={(e) => setFieldValue('reactive_strategies', e.target.value)}
                      placeholder="Response strategies: de-escalation techniques, staff protocols, verbal interventions, safety procedures..."
                      className="input min-h-[100px]"
                    />
                  </div>

                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label max-w-56">Escalation Steps</label>
                    <Textarea
                      name="escalation_steps"
                      value={values.escalation_steps}
                      onChange={(e) => setFieldValue('escalation_steps', e.target.value)}
                      placeholder="Step-by-step protocol: when to call supervisor, when to call emergency services, documentation requirements..."
                      className="input min-h-[100px]"
                    />
                  </div>

                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label max-w-56">Restricted Practices</label>
                    <Textarea
                      name="restricted_practices"
                      value={values.restricted_practices}
                      onChange={(e) => setFieldValue('restricted_practices', e.target.value)}
                      placeholder='Authorised/not authorised practices, conditions for use, reporting requirements. Write "None authorised" if none...'
                      className="input min-h-[100px]"
                    />
                  </div>

                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label max-w-56">Support Requirements</label>
                    <Textarea
                      name="support_requirements"
                      value={values.support_requirements}
                      onChange={(e) => setFieldValue('support_requirements', e.target.value)}
                      placeholder="Staffing ratios (1:1, 2:1), supervision levels, transition support, staff skill requirements..."
                      className="input min-h-[100px]"
                    />
                  </div>

                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label max-w-56">Risk Indicators</label>
                    <Textarea
                      name="risk_indicators"
                      value={values.risk_indicators}
                      onChange={(e) => setFieldValue('risk_indicators', e.target.value)}
                      placeholder="Risk levels: harm to self (low/medium/high), harm to others, flight risk, property damage risk..."
                      className="input min-h-[100px]"
                    />
                  </div>

                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label max-w-56">Risk Factors (Legacy)</label>
                    <Textarea
                      name="risk_factors"
                      value={values.risk_factors}
                      onChange={(e) => setFieldValue('risk_factors', e.target.value)}
                      placeholder="Legacy field - known risk factors..."
                      className="input min-h-[100px]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Support Context Section */}
            <div className="card">
              <div
                className="card-header cursor-pointer flex items-center justify-between bg-warning-light"
                onClick={() => toggleSection('support')}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-warning-light">
                    <KeenIcon icon="home-2" className="text-warning text-lg" />
                  </div>
                  <div>
                    <h3 className="card-title">Support Context</h3>
                    <p className="text-sm text-gray-700">Communication, sensory, and environmental needs</p>
                  </div>
                </div>
                <KeenIcon icon={expandedSections.support ? 'up' : 'down'} className="text-gray-600" />
              </div>
              {expandedSections.support && (
                <div className="card-body py-10 grid gap-5">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label max-w-56">Sensory Profile</label>
                    <Textarea
                      name="sensory_profile"
                      value={values.sensory_profile}
                      onChange={(e) => setFieldValue('sensory_profile', e.target.value)}
                      placeholder="Sensory sensitivities: noise, tactile, visual, proprioceptive needs, sensory seeking/avoiding behaviours..."
                      className="input min-h-[100px]"
                    />
                  </div>

                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label max-w-56">Communication Style</label>
                    <Textarea
                      name="communication_style"
                      value={values.communication_style}
                      onChange={(e) => setFieldValue('communication_style', e.target.value)}
                      placeholder="Receptive/expressive communication, processing time needed, preferred modalities, AAC needs..."
                      className="input min-h-[100px]"
                    />
                  </div>

                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label max-w-56">Environmental Needs</label>
                    <Textarea
                      name="environmental_needs"
                      value={values.environmental_needs}
                      onChange={(e) => setFieldValue('environmental_needs', e.target.value)}
                      placeholder="Lighting preferences, noise levels, space requirements, temperature, access to calming spaces..."
                      className="input min-h-[100px]"
                    />
                  </div>

                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label max-w-56">Support Environment / Family Context</label>
                    <Textarea
                      name="support_environment_family_context"
                      value={values.support_environment_family_context}
                      onChange={(e) => setFieldValue('support_environment_family_context', e.target.value)}
                      placeholder="Living situation, family/carer involvement, home environment, community access considerations..."
                      className="input min-h-[100px]"
                    />
                  </div>

                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label max-w-56">Functional & Daily Living Profile</label>
                    <Textarea
                      name="functional_daily_living_profile"
                      value={values.functional_daily_living_profile}
                      onChange={(e) => setFieldValue('functional_daily_living_profile', e.target.value)}
                      placeholder="Daily living skills, routines, functional limitations, mobility considerations, safety in daily activities..."
                      className="input min-h-[100px]"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => navigate('/participants')}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Participant'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export { AddParticipantForm };
