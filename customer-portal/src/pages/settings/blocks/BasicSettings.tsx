import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { DefaultTooltip, KeenIcon } from '@/components';
import { type MouseEvent, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/auth';
import clsx from 'clsx';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { updateProfile } from '@/services/api/profile';

interface IGeneralSettingsProps {
  title: string;
}

const profileSchema = Yup.object().shape({
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  phone: Yup.string()
    .matches(/^\d{10}$/, 'Phone number must be exactly 10 digits')
    .required('Phone number is required'),
  dob: Yup.string().optional(),
  ndis_number: Yup.string()
    .test('ndis-format', 'NDIS number must be exactly 9 digits', function (value) {
      if (!value || value.length === 0) return true; // Allow empty
      return /^\d{9}$/.test(value);
    })
    .optional(),
  ndis_plan_type: Yup.string().optional(),
  ndis_plan_date: Yup.string().optional(),
  email: Yup.string()
    .email('Wrong email format')
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .optional(),
  password: Yup.string().optional(),
  confirmPassword: Yup.string()
    .when('password', {
      is: (password: string) => password && password.length > 0,
      then: (schema) => schema.required('Please confirm your password'),
      otherwise: (schema) => schema.optional()
    })
    .test('passwords-match', 'Passwords must match', function (value) {
      const { password } = this.parent;
      // If password is empty, confirmPassword can be empty too
      if (!password || password.length === 0) {
        return !value || value.length === 0;
      }
      // If password has value, confirmPassword must match
      return password === value;
    })
});

const BasicSettings = ({ title }: IGeneralSettingsProps) => {
  const { currentUser } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [date, setDate] = useState<Date | undefined>(
    currentUser?.dob ? new Date(currentUser?.dob) : new Date(1940, 0, 1)
  );
  const [ndisPlanDate, setNdisPlanDate] = useState<Date | undefined>(
    currentUser?.ndis_plan_date ? new Date(currentUser?.ndis_plan_date) : new Date(2025, 0, 1)
  );
  const togglePassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setShowPassword(!showPassword);
  };

  const toggleConfirmPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setShowConfirmPassword(!showConfirmPassword);
  };

  const initialValues = {
    first_name: currentUser?.first_name || '',
    last_name: currentUser?.last_name || '',
    phone: currentUser?.phone || '',
    dob: currentUser?.dob || '',
    ndis_number: currentUser?.ndis_number || '',
    ndis_plan_type: currentUser?.ndis_plan_type || '',
    ndis_plan_date: currentUser?.ndis_plan_date || '',
    email: currentUser?.email || '',
    password: '',
    confirmPassword: ''
  };
  const formik = useFormik({
    initialValues,
    validationSchema: profileSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        // Only include email if it's different from the current user's email
        const { email, ...restValues } = values;
        const payload = values.email === currentUser?.email 
          ? restValues
          : values;
        
        await updateProfile(payload);
      } catch (error) {
        console.error('Profile update failed:', error);
      }
    }
  });

  console.log('-----------', formik.errors);

  return (
    <div className="card pb-2.5">
      <div className="card-header" id="general_settings">
        <h3 className="card-title">{title}</h3>
      </div>

      <form onSubmit={formik.handleSubmit}>
        <div className="card-body grid gap-5">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label max-w-56 flex items-center">
              First Name
              <DefaultTooltip
                title={
                  'These are the items related to the NDIS participant, whether it is yourself or someone you are acting on behalf of. We do not currently support the option to act on behalf of multiple participants from a single user account.'
                }
                placement={'top'}
              >
                <KeenIcon icon="information-2" className="text-gray-500 text-lg mx-4" />
              </DefaultTooltip>
            </label>

            <label className="input">
              <input
                placeholder="Enter Name"
                autoComplete="off"
                {...formik.getFieldProps('first_name')}
                className={clsx('form-control', {
                  'is-invalid': formik.touched.first_name && formik.errors.first_name
                })}
              />
            </label>
            {formik.touched.first_name && formik.errors.first_name && (
              <span role="alert" className="text-danger text-xs">
                {formik.errors.first_name}
              </span>
            )}
          </div>
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label max-w-56 ">Last Name</label>
            <label className="input">
              <input
                placeholder="Enter Name"
                autoComplete="off"
                {...formik.getFieldProps('last_name')}
                className={clsx('form-control', {
                  'is-invalid': formik.touched.last_name && formik.errors.last_name
                })}
              />
            </label>
            {formik.touched.last_name && formik.errors.last_name && (
              <span role="alert" className="text-danger text-xs">
                {formik.errors.last_name}
              </span>
            )}
          </div>
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label max-w-56 items-center">
              Phone Number
              <DefaultTooltip
                title={
                  'Providing your phone number allows us to contact you quickly if needed, for example if you have requested a service and we need additional information from you. Providing a mobile number is best as we plan to provide SMS notifications of important events in the near future.'
                }
                placement={'top'}
              >
                <KeenIcon icon="information-2" className="text-gray-500 text-lg mx-4" />
              </DefaultTooltip>
            </label>
            <label className="input">
              <input
                placeholder="Enter Phone Number"
                autoComplete="off"
                maxLength={10}
                {...formik.getFieldProps('phone')}
                className={clsx('form-control', {
                  'is-invalid': formik.touched.phone && formik.errors.phone
                })}
              />
            </label>
            {formik.touched.phone && formik.errors.phone && (
              <span role="alert" className="text-danger text-xs">
                {formik.errors.phone}
              </span>
            )}
          </div>
          <div className="w-full">
            <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
              <label className="form-label flex items-center gap-1 max-w-56 ">
                Birth Date
                <DefaultTooltip
                  title={'Providing your date of birth allows us to improve content relevance.'}
                  placement={'top'}
                >
                  <KeenIcon icon="information-2" className="text-gray-500 text-lg mx-4" />
                </DefaultTooltip>
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    id="date"
                    className={cn(
                      'input data-[state=open]:border-primary',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <KeenIcon icon="calendar" className="-ms-0.5" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="single"
                    defaultMonth={date}
                    toDate={new Date()}
                    selected={date}
                    onSelect={(date: any) => {
                      setDate(date);
                      if (date) {
                        // Add one day to compensate for server timezone conversion
                        const adjustedDate = new Date(date);
                        adjustedDate.setDate(adjustedDate.getDate() + 1);
                        const formattedDate = adjustedDate.toISOString().split('T')[0];
                        formik.setFieldValue('dob', formattedDate);
                      } else {
                        formik.setFieldValue('dob', '');
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
              {formik.touched.dob && formik.errors.dob && (
                <span role="alert" className="text-danger text-xs block mt-1">
                  {formik.errors.dob}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label max-w-56 items-center">
              NDIS number{' '}
              <DefaultTooltip
                title={
                  'Providing your NDIS number allows us to respond to service requests faster.'
                }
                placement={'top'}
              >
                <KeenIcon icon="information-2" className="text-gray-500 text-lg mx-4" />
              </DefaultTooltip>
            </label>
            <label className="input">
              <input
                placeholder="Enter NDIS Number"
                autoComplete="off"
                maxLength={9}
                {...formik.getFieldProps('ndis_number')}
                className={clsx('form-control', {
                  'is-invalid': formik.touched.ndis_number && formik.errors.ndis_number
                })}
              />
            </label>
            {formik.touched.ndis_number && formik.errors.ndis_number && (
              <span role="alert" className="text-danger text-xs">
                {formik.errors.ndis_number}
              </span>
            )}
          </div>

          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label max-w-56 items-center">
              NDIS Type{' '}
              <DefaultTooltip
                title={'Providing your NDIS plan type allows us to improve content relevance.'}
                placement={'top'}
              >
                <KeenIcon icon="information-2" className="text-gray-500 text-lg mx-4" />
              </DefaultTooltip>
            </label>
            <div className="w-full">
              <Select
                defaultValue={currentUser?.ndis_plan_type || 'self-Managed'}
                onValueChange={(value) => {
                  formik.setFieldValue('ndis_plan_type', value);
                }}
              >
                <SelectTrigger
                  className={clsx({
                    'border-red-500': formik.touched.ndis_plan_type && formik.errors.ndis_plan_type
                  })}
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Self-Managed">Self-Managed</SelectItem>
                  <SelectItem value="Plan Managed">Plan Managed</SelectItem>
                  <SelectItem value="Agency Managed">Agency Managed</SelectItem>
                </SelectContent>
              </Select>
              {formik.touched.ndis_plan_type && formik.errors.ndis_plan_type && (
                <span role="alert" className="text-danger text-xs block mt-1">
                  {formik.errors.ndis_plan_type}
                </span>
              )}
            </div>
          </div>
          <div className="w-full">
            <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
              <label className="form-label flex items-center gap-1 max-w-56">
                NDIS plan start date{' '}
                <DefaultTooltip
                  title={
                    'Providing your NDIS plan start date allows us to personalise notifications and content.'
                  }
                  placement={'top'}
                >
                  <KeenIcon icon="information-2" className="text-gray-500 text-lg mx-4" />
                </DefaultTooltip>
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    id="ndis-plan-date"
                    className={cn(
                      'input data-[state=open]:border-primary',
                      !ndisPlanDate && 'text-muted-foreground'
                    )}
                  >
                    <KeenIcon icon="calendar" className="-ms-0.5" />
                    {ndisPlanDate ? format(ndisPlanDate, 'PPP') : <span>Pick a date</span>}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="single"
                    toDate={new Date()}
                    defaultMonth={ndisPlanDate}
                    selected={ndisPlanDate}
                    onSelect={(date: any) => {
                      setNdisPlanDate(date);
                      if (date) {
                        // Add one day to compensate for server timezone conversion
                        const adjustedDate = new Date(date);
                        adjustedDate.setDate(adjustedDate.getDate() + 1);
                        const formattedDate = adjustedDate.toISOString().split('T')[0];
                        formik.setFieldValue('ndis_plan_date', formattedDate);
                      } else {
                        formik.setFieldValue('ndis_plan_date', '');
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
              {formik.touched.ndis_plan_date && formik.errors.ndis_plan_date && (
                <span role="alert" className="text-danger text-xs block mt-1">
                  {formik.errors.ndis_plan_date}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label max-w-56">Email</label>
            <label className="input">
              <input
                placeholder="Enter email"
                autoComplete="off"
                {...formik.getFieldProps('email')}
                className={clsx('form-control', {
                  'is-invalid': formik.touched.email && formik.errors.email
                })}
              />
            </label>
            {formik.touched.email && formik.errors.email && (
              <span role="alert" className="text-danger text-xs">
                {formik.errors.email}
              </span>
            )}
          </div>

          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label max-w-56">Change Password</label>
            <label className="input">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter Password"
                autoComplete="off"
                {...formik.getFieldProps('password')}
                className={clsx('form-control', {
                  'is-invalid': formik.touched.password && formik.errors.password
                })}
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
              <span role="alert" className="text-danger text-xs">
                {formik.errors.password}
              </span>
            )}
          </div>

          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label max-w-56">Confirm Password</label>
            <label className="input">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                autoComplete="off"
                {...formik.getFieldProps('confirmPassword')}
                className={clsx('form-control', {
                  'is-invalid': formik.touched.confirmPassword && formik.errors.confirmPassword
                })}
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
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <span role="alert" className="text-danger text-xs">
                {formik.errors.confirmPassword}
              </span>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="btn btn-primary flex justify-center"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? 'Please wait...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export { BasicSettings, type IGeneralSettingsProps };
