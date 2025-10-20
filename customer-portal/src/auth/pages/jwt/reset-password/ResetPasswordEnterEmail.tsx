import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeenIcon, Alert } from '@/components';
import { useLayout } from '@/providers';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { forgotPassword } from '@/services/api/auth';
import { toast } from 'sonner';

const emailSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email format').required('Email is required')
});

const ResetPasswordEnterEmail = () => {
  const { currentLayout } = useLayout();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hasErrors, setHasErrors] = useState<boolean | undefined>(undefined);

  const formik = useFormik({
    initialValues: {
      email: ''
    },
    validationSchema: emailSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      setHasErrors(undefined);

      try {
        await forgotPassword(values.email);
        setHasErrors(false);
        toast.success('Password reset link sent to your email', { position: 'top-right' });
        navigate('/');
      } catch (error: any) {
        setHasErrors(true);
        setStatus(
          error?.response?.data?.message || 'Failed to send reset email. Please try again.'
        );
        toast.error(error?.response?.data?.message || 'Failed to send reset email', {
          position: 'top-right'
        });
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    }
  });

  return (
    <div className="card max-w-[370px] w-full">
      <form
        className="card-body flex flex-col gap-5 p-10"
        onSubmit={formik.handleSubmit}
        noValidate
      >
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Your Email</h3>
          <span className="text-2sm text-gray-700">Enter your email to reset password</span>
        </div>

        {hasErrors && <Alert variant="danger">{formik.status}</Alert>}

        <div className="flex flex-col gap-1">
          <label className="form-label font-normal text-gray-900">Email</label>
          <input
            className="input"
            type="email"
            placeholder="email@email.com"
            {...formik.getFieldProps('email')}
          />
          {formik.touched.email && formik.errors.email && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.email}
            </span>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary flex justify-center grow"
          disabled={loading || formik.isSubmitting}
        >
          {loading ? 'Sending...' : 'Continue'}
          {!loading && <KeenIcon icon="black-right" />}
        </button>
      </form>
    </div>
  );
};

export { ResetPasswordEnterEmail };
