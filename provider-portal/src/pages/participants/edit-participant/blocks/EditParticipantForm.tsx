import { useEffect, useState } from 'react';
import { Formik, Form, FormikProps } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router';
import { updateParticipant, getSingleParticipant } from '@/services/api';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useAuthContext } from '@/auth';
import { ProgressBarLoader } from '@/components/loaders/ProgressBarLoader';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const participantSchema = Yup.object().shape({
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string(),
  dob: Yup.string(),
  gender: Yup.string().oneOf(['male', 'female', 'other', 'prefer_not_to_say']),
  contact_email: Yup.string().email('Invalid email format'),
  contact_phone: Yup.string(),
  status: Yup.string().oneOf(['active', 'inactive']).required('Status is required'),
  medical_conditions: Yup.string()
});

const EditParticipantForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState({
    first_name: '',
    last_name: '',
    dob: '',
    gender: '',
    contact_email: '',
    contact_phone: '',
    status: 'active',
    medical_conditions: '',
    assigned_practitioner_id: '',
    assigned_worker_ids: [] as number[]
  });

  useEffect(() => {
    if (id) {
      const fetchParticipant = async () => {
        try {
          const response = await getSingleParticipant(id);
          const participant = response.participant || response;

          setInitialValues({
            first_name: participant.first_name || '',
            last_name: participant.last_name || '',
            dob: participant.dob || '',
            gender: participant.gender || '',
            contact_email: participant.contact_email || '',
            contact_phone: participant.contact_phone || '',
            status: participant.status || 'active',
            medical_conditions: participant.medical_conditions || '',
            assigned_practitioner_id: participant.assigned_practitioner_id || '',
            assigned_worker_ids: participant.assigned_worker_ids || []
          });
          setLoading(false);
        } catch (error) {
          console.error('Error fetching participant:', error);
          toast.error('Failed to load participant data');
          setLoading(false);
        }
      };
      fetchParticipant();
    }
  }, [id]);

  if (loading) {
    return <ProgressBarLoader />;
  }

  return (
    <div className="card">
      <div className="card-header" id="basic_settings">
        <h3 className="card-title">Edit Participant</h3>
      </div>
      <div className="card-body py-10 grid gap-5">
        <Formik
          enableReinitialize={true}
          initialValues={initialValues}
          validationSchema={participantSchema}
          onSubmit={async (values, { setSubmitting: setFormSubmitting }) => {
            setSubmitting(true);
            try {
              const formData = {
                first_name: values.first_name,
                last_name: values.last_name,
                dob: values.dob,
                gender: values.gender,
                contact_email: values.contact_email,
                contact_phone: values.contact_phone,
                status: values.status,
                medical_conditions: values.medical_conditions,
                assigned_practitioner_id: values.assigned_practitioner_id || null,
                assigned_worker_ids: values.assigned_worker_ids
              };

              await updateParticipant(id, formData);
              // Success toast is shown automatically by axios interceptor
              navigate('/participants');
            } catch (error) {
              console.error('Error updating participant:', error);
              // Error toast is shown automatically by axios interceptor
            } finally {
              setSubmitting(false);
              setFormSubmitting(false);
            }
          }}
        >
          {({ errors, touched, setFieldValue, values }: FormikProps<typeof initialValues>) => (
            <Form className="grid gap-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="form-label max-w-56">Status</label>
                <Switch
                  checked={values.status === 'active'}
                  onCheckedChange={(checked) => {
                    setFieldValue('status', checked ? 'active' : 'inactive');
                  }}
                />
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
                <label className="form-label max-w-56">Last Name</label>
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
                <label className="form-label max-w-56">Date of Birth</label>
                <div className="flex flex-col w-full gap-2.5">
                  <Input
                    type="date"
                    name="dob"
                    value={values.dob}
                    onChange={(e) => setFieldValue('dob', e.target.value)}
                    className="input"
                  />
                  {errors.dob && touched.dob && (
                    <span className="text-danger text-xs">{String(errors.dob)}</span>
                  )}
                </div>
              </div>

              <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                <label className="form-label max-w-56">Gender</label>
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
                <label className="form-label max-w-56">Medical Conditions</label>
                <div className="flex flex-col w-full gap-2.5">
                  <Textarea
                    name="medical_conditions"
                    value={values.medical_conditions}
                    onChange={(e) => setFieldValue('medical_conditions', e.target.value)}
                    placeholder="Enter any medical conditions or notes"
                    className="textarea"
                    rows={4}
                  />
                  {errors.medical_conditions && touched.medical_conditions && (
                    <span className="text-danger text-xs">{String(errors.medical_conditions)}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => navigate('/participants')}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Updating...' : 'Update Participant'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export { EditParticipantForm };
