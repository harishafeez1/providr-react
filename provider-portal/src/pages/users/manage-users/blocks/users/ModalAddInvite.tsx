import React, { forwardRef, useState } from 'react';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useAuthContext } from '@/auth';
import { KeenIcon } from '@/components';
import clsx from 'clsx';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { inviteUser } from '@/services/api';
import { Button } from '@/components/ui/button';

interface IModalAddInviteProps {
  open: boolean;
  onOpenChange: () => void;
  onSaveConfirm: () => void;
}

const ModalAddInvite = forwardRef<HTMLDivElement, IModalAddInviteProps>(
  ({ open, onOpenChange, onSaveConfirm }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { currentUser } = useAuthContext();
    const [selected, setSelected] = useState<string[]>([]);

    const accountUpdateSchema = Yup.object().shape({
      firstName: Yup.string()
        .min(3, 'Minimum 3 symbols')
        .max(50, 'Maximum 50 symbols')
        .required('First name is required'),
      lastName: Yup.string()
        .min(3, 'Minimum 3 symbols')
        .max(50, 'Maximum 50 symbols')
        .required('Last name is required'),
      email: Yup.string()
        .email('Invalid email format')
        .min(3, 'Minimum 3 symbols')
        .max(50, 'Maximum 50 symbols')
        .required('Email is required'),
      phone: Yup.string()
        .matches(/^[+]?\d+$/, 'Phone number must be digits only')
        .min(7, 'Minimum 7 digits')
        .max(15, 'Maximum 15 digits')
        .required('Phone number is required'),
      password: Yup.string().min(3, 'Minimum 3 symbols').max(50, 'Maximum 50 symbols').notRequired() // Changed to notRequired
    });

    const initialValues = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: ''
    };

    const options = ['Admin', 'Editor', 'Reviews', 'Billing', 'Intake'];
    const value = [
      'admin',
      'permission_editor',
      'permission_review',
      'permission_billing',
      'permission_intake'
    ];
    const handleCheckboxChange = (index: number) => {
      const selectedValue = value[index];

      setSelected((prevSelected) => {
        if (selectedValue === 'admin') {
          // If "Admin" is selected, uncheck all others and select only "Admin"
          return ['admin'];
        } else if (prevSelected.includes('admin')) {
          // If "Admin" is already selected and another checkbox is selected, uncheck "Admin"
          return [selectedValue];
        } else {
          if (prevSelected.includes(selectedValue)) {
            return prevSelected.filter((val) => val !== selectedValue);
          } else {
            return [...prevSelected, selectedValue];
          }
        }
      });
    };

    const togglePassword = (event: React.MouseEvent) => {
      event.preventDefault();
      setShowPassword((prev) => !prev);
    };

    const formik = useFormik({
      initialValues,
      validationSchema: accountUpdateSchema,
      onSubmit: async (values, { resetForm, setSubmitting }) => {
        setLoading(true);
        try {
          const rolesObject = value.reduce(
            (acc, val) => {
              acc[val] = selected.includes(val) ? 1 : 0;
              return acc;
            },
            {} as Record<string, number>
          );
          console.log(
            values.firstName,
            values.lastName,
            values.phone,
            values.email,
            values.password,
            rolesObject
          );
          await inviteUser(currentUser?.provider_company_id ?? '', {
            first_name: values.firstName ? values.firstName : '',
            last_name: values.lastName ? values.lastName : '',
            phone: values.phone ? values.phone : '',
            email: values.email ? values.email : '',
            password: values.password ? values.password : '',
            ...rolesObject
          });
          setSubmitting(false);
          setLoading(false);
          onSaveConfirm();
          onOpenChange();
          resetForm();
        } catch (error) {
          console.error('Account update error:', error);
          setSubmitting(false);
          setLoading(false);
        }
      }
    });

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full max-w-[500px] max-h-[95%] scrollable-y-auto" ref={ref}>
          <DialogHeader className="justify-between border-0 pt-5">
            <DialogTitle>Invite Users</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <DialogBody className="py-0 overflow-y-auto max-h-[50vh]">
            <div className="flex grow gap-5 lg:gap-7.5">
              <form noValidate onSubmit={formik.handleSubmit} className="grid gap-5 py-4">
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
                          { 'is-valid': formik.touched.lastName && !formik.errors.lastName }
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
                          { 'is-valid': formik.touched.email && !formik.errors.email }
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
                  <label className="form-label w-40 text-gray-900">Phone</label>
                  <div className="flex flex-col flex-1">
                    <label className="input">
                      <input
                        placeholder="Enter your phone number"
                        type="text"
                        autoComplete="off"
                        {...formik.getFieldProps('phone')}
                        className={clsx(
                          'form-control bg-transparent',
                          { 'is-invalid': formik.touched.phone && formik.errors.phone },
                          { 'is-valid': formik.touched.phone && !formik.errors.phone }
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

                <div>
                  <label className="form-label max-w-70 my-3">
                    Select the initial roles for the new user. You can change these at any time
                    after the user has activated.
                  </label>
                  <div className="block w-full shadow-none outline-none font-medium leading-[1] bg-[var(--tw-light-active)] rounded-[0.375rem] h-auto px-[0.75rem] py-4 border border-[var(--tw-gray-300)] text-[var(--tw-gray-700)]">
                    <div className="grid grid-cols-2 gap-4">
                      {options.map((option, index) => (
                        <label
                          key={index}
                          className="checkbox-group flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            className="checkbox"
                            name="attributes"
                            type="checkbox"
                            value={option}
                            onChange={() => handleCheckboxChange(index)}
                            checked={selected.includes(value[index])}
                          />
                          <span className="checkbox-label">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </DialogBody>
          <DialogFooter>
            <form noValidate onSubmit={formik.handleSubmit} className="grid gap-5 py-4">
              <div className="flex justify-end gap-2">
                <Button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || formik.isSubmitting}
                >
                  {loading ? 'Please wait...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

export { ModalAddInvite };
