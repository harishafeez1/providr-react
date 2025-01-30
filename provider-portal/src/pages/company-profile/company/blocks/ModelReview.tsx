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
import clsx from 'clsx';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Button } from '@/components/ui/button';

interface IModalAddInviteProps {
  open: boolean;
  onOpenChange: () => void;
  onSaveConfirm: () => void;
}

const ModelReview = forwardRef<HTMLDivElement, IModalAddInviteProps>(
  ({ open, onOpenChange, onSaveConfirm }, ref) => {
    const [loading, setLoading] = useState(false);
    const { currentUser } = useAuthContext();

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
      firstName: currentUser?.first_name || '',
      lastName: currentUser?.last_name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      password: ''
    };

    const formik = useFormik({
      initialValues,
      validationSchema: accountUpdateSchema,
      onSubmit: async (values, { resetForm, setSubmitting }) => {
        setLoading(true);
        try {
          console.log(
            values.firstName,
            values.lastName,
            values.phone,
            values.email,
            values.password
          );

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

export { ModelReview };
