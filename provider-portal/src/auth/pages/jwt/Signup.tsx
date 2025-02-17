import clsx from 'clsx';
import { useFormik } from 'formik';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useGoogleLogin } from '@react-oauth/google';

import { useAuthContext } from '../../useAuthContext';
import { toAbsoluteUrl } from '@/utils';
import { Alert, KeenIcon, ScreenLoader } from '@/components';
import { useLayout } from '@/providers';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

// Initial form values
const initialValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  changepassword: '',
  businessName: '',
  jobRole: '',
  phoneNumber: '',
  acceptTerms: false,
  NDISProvider: false,
  NDISCoordinator: false,
  goalValidation: ''
};

// Validation schema for the form
const signupSchema = Yup.object().shape({
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
  password: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Password is required'),
  changepassword: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Password confirmation is required')
    .oneOf([Yup.ref('password')], "Password and Confirm Password didn't match"),
  businessName: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Bussiness name is required'),
  phoneNumber: Yup.string()
    .matches(/^[0-9]+$/, 'Phone number must be digits only')
    .min(10, 'Minimum 10 digits')
    .max(15, 'Maximum 15 digits')
    .required('Phone number is required'),
  jobRole: Yup.string().required('Job is required'),
  NDISProvider: Yup.boolean(),
  NDISCoordinator: Yup.boolean(),
  goalValidation: Yup.mixed().test(
    'one-goal-required',
    'You must select either NDIS Provider or NDIS Coordinator',
    function () {
      const { NDISProvider, NDISCoordinator } = this.parent;
      return NDISProvider || NDISCoordinator;
    }
  ),
  acceptTerms: Yup.bool()
    .oneOf([true], 'You must accept the terms and conditions')
    .required('You must accept the terms and conditions')
});

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const { register, googleLogin } = useAuthContext();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { currentLayout } = useLayout();

  // Formik setup
  const formik = useFormik({
    initialValues,
    validationSchema: signupSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setLoading(true);
      try {
        if (!register) {
          throw new Error('JWTProvider is required for this form.');
        }
        await register(
          values.firstName ? values.firstName : '',
          values.lastName ? values.lastName : '',
          values.phoneNumber ? values.phoneNumber : '',
          values.businessName ? values.businessName : '',
          values.jobRole ? values.jobRole : '',
          values.NDISProvider ? true : false,
          values.email ? values.email : '',
          values.password
        );
        navigate('/company-profile/add-profile');
      } catch (error: any) {
        console.error(error);
        setSubmitting(false);
        setLoading(false);
      }
    }
  });

  // Toggle password visibility
  const togglePassword = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPassword = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setShowConfirmPassword(!showConfirmPassword);
  };

  const gooleLogin = useGoogleLogin({
    onSuccess: async (code) => {
      try {
        setLoading(true);
        await googleLogin(code);
        navigate('/');
        setLoading(false);
      } catch {
        // setStatus('The login details are incorrect');
        // setSubmitting(false);
        setLoading(false);
      }
    },
    flow: 'auth-code',
    onError: () => {
      console.log('Login Failed');
    }
  });

  if (loading) {
    return <ScreenLoader />;
  }

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
            <Link
              to={currentLayout?.name === 'auth-branded' ? '/auth/login' : '/auth/classic/login'}
              className="text-2sm link"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="grid grid-cols gap-2.5">
          <a onClick={() => gooleLogin()} className="btn btn-light btn-sm justify-center">
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

        {/* First Name Field */}
        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">Frist Name</label>
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
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.firstName}
            </span>
          )}
        </div>

        {/* Last Name Field */}
        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">Last Name</label>
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
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.lastName}
            </span>
          )}
        </div>

        {/* Business Name Field */}
        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">Bussiness Name</label>
          <label className="input">
            <input
              placeholder="Enter your bussiness name"
              type="text"
              autoComplete="off"
              {...formik.getFieldProps('businessName')}
              className={clsx(
                'form-control bg-transparent',
                { 'is-invalid': formik.touched.businessName && formik.errors.businessName },
                {
                  'is-valid': formik.touched.businessName && !formik.errors.businessName
                }
              )}
            />
          </label>
          {formik.touched.businessName && formik.errors.businessName && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.businessName}
            </span>
          )}
        </div>

        {/* Job Role Field */}
        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">What is your job role?</label>

          <Select
            value={formik.values.jobRole}
            onChange={(value) => formik.setFieldValue('jobRole', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select job role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Owner/General Manager">Owner/General Manager</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Support Coordinator">Support Coordinator</SelectItem>
              <SelectItem value="Sales Manager or Sales staff">
                Sales Manager or Sales staff
              </SelectItem>
              <SelectItem value="others">Others</SelectItem>
            </SelectContent>
          </Select>

          {formik.touched.jobRole && formik.errors.jobRole && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.jobRole}
            </span>
          )}
        </div>

        {/* Email Field */}
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

        {/* Password Field */}
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

        {/* Confirm Password Field */}
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

        {/* goals Field */}
        <div className="flex flex-col gap-1">
          {formik?.errors?.goalValidation && (
            <span role="alert" className="text-danger text-xs mb-2">
              {formik?.errors?.goalValidation}
            </span>
          )}
          <label className="form-label text-gray-900">What best describes your goal</label>

          <label className="checkbox-group">
            <input
              className="checkbox checkbox-sm"
              type="checkbox"
              checked={formik.values.NDISProvider}
              onChange={() => {
                formik.setFieldValue('NDISProvider', !formik.values.NDISProvider);
                formik.setFieldValue('NDISCoordinator', false);
              }}
              disabled={formik.values.NDISCoordinator}
            />
            <span className="checkbox-label">
              I am a Provider and want to grow my business, get NDIS leads
            </span>
          </label>
          <label className="checkbox-group">
            <input
              className="checkbox checkbox-sm"
              type="checkbox"
              checked={formik.values.NDISCoordinator}
              onChange={() => {
                formik.setFieldValue('NDISCoordinator', !formik.values.NDISCoordinator);
                formik.setFieldValue('NDISProvider', false);
              }}
              disabled={formik.values.NDISProvider}
            />
            <span className="checkbox-label">
              I am Support Coordinator and want to help my participants find NDIS providers
            </span>
          </label>
        </div>

        {/* Accept Terms Field */}
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

        {/* Submit Button */}
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
