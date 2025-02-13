import clsx from 'clsx';
import { useFormik } from 'formik';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

import { useAuthContext } from '../../useAuthContext';
import { toAbsoluteUrl } from '@/utils';
import { Alert, KeenIcon } from '@/components';

const initialValues = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  changepassword: '',
  phoneNumber: '',
  acceptTerms: false
};

const signupSchema = Yup.object().shape({
  email: Yup.string()
    .email('Wrong email format')
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Email is required'),
  password: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Password is required'),
  changepassword: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Password confirmation is required')
    .oneOf([Yup.ref('password')], "Password and Confirm Password didn't match"),
  phoneNumber: Yup.string()
    .matches(/^[0-9]+$/, 'Phone number must be digits only')
    .min(10, 'Minimum 10 digits')
    .max(15, 'Maximum 15 digits')
    .required('Phone number is required'),
  acceptTerms: Yup.bool().required('You must accept the terms and conditions')
});

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const { register } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues,
    validationSchema: signupSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      try {
        if (!register) {
          throw new Error('JWTProvider is required for this form.');
        }
        await register(values.email, values.password, values.changepassword);
        navigate(from, { replace: true });
      } catch (error) {
        console.error(error);
        setStatus('The sign up details are incorrect');
        setSubmitting(false);
        setLoading(false);
      }
    }
  });

  const togglePassword = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setShowPassword(!showPassword);
  };

  const toggleConfirmPassword = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="card max-w-[370px] w-full">
      <form
        className="card-body flex flex-col gap-5 p-10"
        noValidate
        onSubmit={formik.handleSubmit}
      >
        <div className="text-center mb-2.5">
          <h3 className="text-lg font-semibold text-gray-900 leading-none mb-2.5">Sign up</h3>
          <div className="flex items-center justify-center font-medium">
            <span className="text-2sm text-gray-600 me-1.5">Already have an Account ?</span>
            <Link to={'/login'} className="text-2sm link">
              Sign In
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          <a href="#" className="btn btn-light btn-sm justify-center">
            <img
              src={toAbsoluteUrl('/media/brand-logos/google.svg')}
              className="size-3.5 shrink-0"
            />
            Use Google
          </a>
        </div>

        <div className="flex items-center gap-2">
          <span className="border-t border-gray-200 w-full"></span>
          <span className="text-2xs text-gray-500 font-medium uppercase">Or</span>
          <span className="border-t border-gray-200 w-full"></span>
        </div>

        {formik.status && <Alert variant="danger">{formik.status}</Alert>}

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">First Name</label>
          <label className="input">
            <input
              placeholder=""
              type="text"
              autoComplete="off"
              {...formik.getFieldProps('first_name')}
              className={clsx(
                'form-control bg-transparent',
                { 'is-invalid': formik.touched.first_name && formik.errors.first_name },
                {
                  'is-valid': formik.touched.first_name && !formik.errors.first_name
                }
              )}
            />
          </label>
          {formik.touched.first_name && formik.errors.first_name && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.first_name}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">Last Name</label>
          <label className="input">
            <input
              placeholder=""
              type="text"
              autoComplete="off"
              {...formik.getFieldProps('last_name')}
              className={clsx(
                'form-control bg-transparent',
                { 'is-invalid': formik.touched.last_name && formik.errors.last_name },
                {
                  'is-valid': formik.touched.last_name && !formik.errors.last_name
                }
              )}
            />
          </label>
          {formik.touched.last_name && formik.errors.last_name && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.last_name}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">Email</label>
          <label className="input">
            <input
              placeholder="email@email.com"
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
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.email}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">Password</label>
          <label className="input">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter Password"
              autoComplete="off"
              {...formik.getFieldProps('password')}
              className={clsx(
                'form-control bg-transparent',
                {
                  'is-invalid': formik.touched.password && formik.errors.password
                },
                {
                  'is-valid': formik.touched.password && !formik.errors.password
                }
              )}
            />
            <button className="btn btn-icon" onClick={togglePassword}>
              <KeenIcon icon="eye" className={clsx('text-gray-500', { hidden: showPassword })} />
              <KeenIcon
                icon="eye-slash"
                className={clsx('text-gray-500', { hidden: !showPassword })}
              />
            </button>
          </label>
          {formik.touched.password && formik.errors.password && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.password}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">Confirm Password</label>
          <label className="input">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter Password"
              autoComplete="off"
              {...formik.getFieldProps('changepassword')}
              className={clsx(
                'form-control bg-transparent',
                {
                  'is-invalid': formik.touched.changepassword && formik.errors.changepassword
                },
                {
                  'is-valid': formik.touched.changepassword && !formik.errors.changepassword
                }
              )}
            />
            <button className="btn btn-icon" onClick={toggleConfirmPassword}>
              <KeenIcon
                icon="eye"
                className={clsx('text-gray-500', { hidden: showConfirmPassword })}
              />
              <KeenIcon
                icon="eye-slash"
                className={clsx('text-gray-500', { hidden: !showConfirmPassword })}
              />
            </button>
          </label>
          {formik.touched.changepassword && formik.errors.changepassword && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.changepassword}
            </span>
          )}
        </div>

        {/* Phone Number Field */}
        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">What is your mobile phone number?</label>
          <label className="input">
            <input
              placeholder="Enter your mobile phone number"
              type="text"
              autoComplete="off"
              {...formik.getFieldProps('phoneNumber')}
              className={clsx(
                'form-control bg-transparent',
                { 'is-invalid': formik.touched.phoneNumber && formik.errors.phoneNumber },
                {
                  'is-valid': formik.touched.phoneNumber && !formik.errors.phoneNumber
                }
              )}
            />
          </label>
          {formik.touched.phoneNumber && formik.errors.phoneNumber && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.phoneNumber}
            </span>
          )}
        </div>

        <label className="checkbox-group">
          <input
            className="checkbox checkbox-sm"
            type="checkbox"
            {...formik.getFieldProps('acceptTerms')}
          />
          <span className="checkbox-label">
            I accept{' '}
            <Link to="#" className="text-2sm link">
              Terms & Conditions
            </Link>
          </span>
        </label>

        {formik.touched.acceptTerms && formik.errors.acceptTerms && (
          <span role="alert" className="text-danger text-xs mt-1">
            {formik.errors.acceptTerms}
          </span>
        )}

        <button
          type="submit"
          className="btn btn-primary flex justify-center grow"
          disabled={loading || formik.isSubmitting}
        >
          {loading ? 'Please wait...' : 'Sign UP'}
        </button>
      </form>
    </div>
  );
};

export { Signup };
