import { useAuthContext } from '@/auth';
import { KeenIcon } from '@/components';
import clsx from 'clsx';
import { useFormik } from 'formik';
import { useState } from 'react';
import * as Yup from 'yup';

interface IGeneralSettingsProps {
  title: string;
}

const BasicSettings = ({ title }: IGeneralSettingsProps) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { currentUser, getUser, updateUser } = useAuthContext();

  const accountUpdateSchema = Yup.object().shape({
    firstName: Yup.string()
      .min(3, 'Minimum 3 symbols')
      .max(50, 'Maximum 50 symbols')
      .required('First name is required'),
    lastName: Yup.string().min(3, 'Minimum 3 symbols').max(50, 'Maximum 50 symbols'),
    email: Yup.string()
      .email('Wrong email format')
      .min(3, 'Minimum 3 symbols')
      .max(50, 'Maximum 50 symbols')
      .required('Email is required'),
    phone: Yup.string()
      .matches(/^\+?[0-9]+$/, 'Phone number must be digits only')
      .min(7, 'Minimum 7 digits')
      .max(15, 'Maximum 15 digits')
      .required('Phone number is required')
    // password: Yup.string()
    //   .min(3, 'Minimum 3 symbols')
    //   .max(50, 'Maximum 50 symbols')
    //   .required('Password is required')
  });

  const initialValues = {
    firstName: currentUser?.first_name || '',
    lastName: currentUser?.last_name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    password: currentUser?.password || ''
  };

  const formik = useFormik({
    initialValues,
    validationSchema: accountUpdateSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setLoading(true);
      try {
        await updateUser(
          values.firstName ? values.firstName : '',
          values.lastName ? values.lastName : '',
          values.phone ? values.phone : '',
          values.email ? values.email : '',
          values.password ? values.password : ''
        );
        await getUser();
        setSubmitting(false);
        setLoading(false);
      } catch (error: any) {
        console.error('account update error', error);
        setSubmitting(false);
        setLoading(false);
      }
    }
  });

  const togglePassword = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setShowPassword(!showPassword);
  };

  return (
    <div className="card pb-2.5">
      <div className="card-header" id="general_settings">
        <h3 className="card-title">{title}</h3>
      </div>
      <form noValidate onSubmit={formik.handleSubmit}>
        <div className="card-body grid gap-5">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label w-40 text-gray-900">Frist Name</label>
            <div className="flex flex-col flex-1">
              <label className="input">
                <input
                  placeholder="Enter your first name"
                  type="text"
                  autoComplete="off"
                  {...formik.getFieldProps('firstName')}
                  className={clsx(
                    'form-control bg-transparent',
                    { 'is-invalid': formik.touched.firstName && formik.errors.firstName },
                    {
                      'is-valid': formik.touched.firstName && !formik.errors.firstName
                    }
                  )}
                />
              </label>
              {formik.touched.firstName && formik.errors.firstName && (
                <span role="alert" className="text-danger text-xs mt-2">
                  {formik.errors.firstName}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label w-40 text-gray-900">Last Name</label>
            <div className="flex flex-col flex-1">
              <label className="input">
                <input
                  placeholder="Enter your last name"
                  type="text"
                  autoComplete="off"
                  {...formik.getFieldProps('lastName')}
                  className={clsx(
                    'form-control bg-transparent',
                    { 'is-invalid': formik.touched.lastName && formik.errors.lastName },
                    {
                      'is-valid': formik.touched.lastName && !formik.errors.lastName
                    }
                  )}
                />
              </label>
              {formik.touched.lastName && formik.errors.lastName && (
                <span role="alert" className="text-danger text-xs mt-2">
                  {formik.errors.lastName}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label w-40 text-gray-900">Phone Number</label>
            <div className="flex flex-col flex-1">
              <label className="input">
                <input
                  placeholder="Enter your email"
                  type="text"
                  autoComplete="off"
                  {...formik.getFieldProps('phone')}
                  className={clsx(
                    'form-control bg-transparent',
                    { 'is-invalid': formik.touched.phone && formik.errors.phone },
                    {
                      'is-valid': formik.touched.phone && !formik.errors.phone
                    }
                  )}
                />
              </label>
              {formik.touched.phone && formik.errors.phone && (
                <span role="alert" className="text-danger text-xs mt-2">
                  {formik.errors.phone}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label w-40 text-gray-900">Email</label>
            <div className="flex flex-col flex-1">
              <label className="input">
                <input
                  placeholder="Enter your email"
                  type="email"
                  autoComplete="off"
                  {...formik.getFieldProps('email')}
                  className={clsx(
                    'form-control bg-transparent',
                    { 'is-invalid': formik.touched.email && formik.errors.email },
                    {
                      'is-valid': formik.touched.email && !formik.errors.email
                    }
                  )}
                />
              </label>
              {formik.touched.email && formik.errors.email && (
                <span role="alert" className="text-danger text-xs mt-2">
                  {formik.errors.email}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label w-40 text-gray-900">Password</label>
            <div className="flex flex-col flex-1">
              <label className="input">
                <input
                  placeholder="Enter new password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="off"
                  {...formik.getFieldProps('password')}
                  className={clsx(
                    'form-control bg-transparent',
                    { 'is-invalid': formik.touched.password && formik.errors.password },
                    {
                      'is-valid': formik.touched.password && !formik.errors.password
                    }
                  )}
                />
                <div onClick={togglePassword} className="cursor-pointer">
                  <KeenIcon
                    icon="eye"
                    className={clsx('text-gray-500', { hidden: showPassword })}
                  />
                  <KeenIcon
                    icon="eye-slash"
                    className={clsx('text-gray-500', { hidden: !showPassword })}
                  />
                </div>
              </label>
              {formik.touched.password && formik.errors.password && (
                <span role="alert" className="text-danger text-xs mt-2">
                  {formik.errors.password}
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || formik.isSubmitting}
            >
              {loading ? 'Please wait...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export { BasicSettings, type IGeneralSettingsProps };
