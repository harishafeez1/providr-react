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
import { KeenIcon } from '@/components';
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
  phone: Yup.string().required('Phone number is required'),
  dob: Yup.date().required('Date of birth is required'),
  ndis_number: Yup.string().required('NDIS number is required'),
  ndis_plan_type: Yup.string().required('NDIS type is required'),
  ndis_plan_date: Yup.string().required('NDIS plan date is required'),
  email: Yup.string()
    .email('Wrong email format')
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Email is required'),
  password: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Password is required')
});

const BasicSettings = ({ title }: IGeneralSettingsProps) => {
  const { currentUser } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);

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

  const initialValues = {
    first_name: currentUser?.first_name || '',
    last_name: currentUser?.last_name || '',
    phone: currentUser?.phone || '',
    dob: currentUser?.dob || '',
    ndis_number: currentUser?.ndis_number || '',
    ndis_plan_type: currentUser?.ndis_plan_type || '',
    ndis_plan_date: currentUser?.ndis_plan_date || '',
    email: currentUser?.email || '',
    password: ''
  };
  const formik = useFormik({
    initialValues,
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      await updateProfile(values);
    }
  });

  return (
    <div className="card pb-2.5">
      <div className="card-header" id="general_settings">
        <h3 className="card-title">{title}</h3>
      </div>
      <form onSubmit={formik.handleSubmit} noValidate>
        <div className="card-body grid gap-5">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label max-w-56">First Name</label>
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
            <label className="form-label max-w-56">Last Name</label>
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
            <label className="form-label max-w-56">Phone Number</label>
            <label className="input">
              <input
                placeholder="Enter Phone Number"
                autoComplete="off"
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
              <label className="form-label flex items-center gap-1 max-w-56">Birth Date</label>
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
                      formik.setFieldValue('dob', date);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label max-w-56">NDIS number</label>
            <label className="input">
              <input
                placeholder="Enter NDIS Number"
                autoComplete="off"
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
            <label className="form-label max-w-56">NDIS Type</label>
            <Select
              defaultValue={currentUser?.ndis_plan_type || 'self-Managed'}
              onValueChange={(value) => {
                formik.setFieldValue('ndis_plan_type', value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Self-Managed">Self-Managed</SelectItem>
                <SelectItem value="Plan Managed">Plan Managed</SelectItem>
                <SelectItem value="Agency Managed">Agency Managed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full">
            <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
              <label className="form-label flex items-center gap-1 max-w-56">
                NDIS plan start date
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
                      formik.setFieldValue('ndis_plan_date', date);
                    }}
                  />
                </PopoverContent>
              </Popover>
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
