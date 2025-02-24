import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { KeenIcon } from '@/components';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useState } from 'react';
import clsx from 'clsx';

interface IModalDeleteConfirmationProps {
  open: boolean;
  onOpenChange: () => void;
  onDeleteConfirm: () => void;
  loading?: boolean;
}
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Wrong email format')
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Email is required'),
  password: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Password is required'),
  available_services: Yup.string().required('Available Services is required'),
  remember: Yup.boolean()
});
const initialValues = {
  email: '',
  password: '',
  available_services: '',
  remember: false
};
const ModalDeleteConfirmation = ({
  open,
  onOpenChange,
  onDeleteConfirm
}: IModalDeleteConfirmationProps) => {
  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        console.log('ello');
      } catch {
        // setStatus('The login details are incorrect');
        setSubmitting(false);
      }
    }
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[500px] max-h-[95%] scrollable-y-auto">
        <DialogHeader className="justify-between border-0 pt-5">
          <DialogTitle>Connect Directly with 7 Stars Disability Care</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col items-center ">
          <form
            className="card-body flex flex-col gap-5 "
            onSubmit={formik.handleSubmit}
            noValidate
          >
            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Available Services</label>
              <label className="input">
                <input
                  placeholder="Enter username"
                  autoComplete="off"
                  {...formik.getFieldProps('available_services')}
                  className={clsx('form-control', {
                    'is-invalid':
                      formik.touched.available_services && formik.errors.available_services
                  })}
                />
              </label>
              {formik.touched.available_services && formik.errors.available_services && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {formik.errors.available_services}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Phone Number or Email</label>
              <label className="input">
                <input
                  placeholder="Enter username"
                  autoComplete="off"
                  {...formik.getFieldProps('email')}
                  className={clsx('form-control', {
                    'is-invalid': formik.touched.email && formik.errors.email
                  })}
                />
              </label>
              {formik.touched.email && formik.errors.email && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {formik.errors.email}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Name</label>
              <label className="input">
                <input
                  placeholder="Enter Name"
                  autoComplete="off"
                  {...formik.getFieldProps('email')}
                  className={clsx('form-control', {
                    'is-invalid': formik.touched.email && formik.errors.email
                  })}
                />
              </label>
              {formik.touched.email && formik.errors.email && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {formik.errors.email}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Additional Details (Optional)</label>
              <label className="input">
                <input
                  placeholder="Enter Name"
                  autoComplete="off"
                  {...formik.getFieldProps('email')}
                  className={clsx('form-control', {
                    'is-invalid': formik.touched.email && formik.errors.email
                  })}
                />
              </label>
              {formik.touched.email && formik.errors.email && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {formik.errors.email}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary flex justify-center grow"
              disabled={formik.isSubmitting}
            >
              {'Connect'}
            </button>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { ModalDeleteConfirmation };
