import { Modal, ModalBody } from '@/components';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useViewport } from '@/hooks';
import { forwardRef, useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppSelector } from '@/redux/hooks';
import { getDirectConnectProvider } from '@/services/api/provider-profile';
import { useParams } from 'react-router-dom';

interface ConnectProviderModalProps {
  open: boolean;
  onOpenChange: () => void;
}

const initialValues = {
  service_id: '',
  first_name: '',
  last_name: '',
  preferred_method: 'email',
  email: '',
  phone: ''
};

const contactSchema = Yup.object().shape({
  service_id: Yup.string().required('Service is required'),
  first_name: Yup.string().required('First Name is required'),
  preferred_method: Yup.string()
    .oneOf(['email', 'phone'], 'Select a valid method')
    .required('Select a method'),

  email: Yup.string()
    .email('Wrong email format')
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .when('preferred_method', {
      is: 'email',
      then: (schema) => schema.required('Email is required'),
      otherwise: (schema) => schema.notRequired()
    }),

  phone: Yup.string()
    .matches(/^[0-9]+$/, 'Phone number must be digits only')
    .min(10, 'Minimum 10 digits')
    .max(15, 'Maximum 15 digits')
    .when('preferred_method', {
      is: 'phone',
      then: (schema) => schema.required('Phone number is required'),
      otherwise: (schema) => schema.notRequired()
    })
});

const ConnectProviderModal = forwardRef<HTMLDivElement, ConnectProviderModalProps>(
  ({ open, onOpenChange }, ref) => {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [prefferedMethod, setPreferredMethod] = useState('');
    const [selectedServiceName, setSelectedServiceName] = useState('Select Service');
    const { providerProfile } = useAppSelector((state) => state.serviceRequest);

    const formik = useFormik({
      initialValues,
      validationSchema: contactSchema,
      onSubmit: async (values, { setStatus, setSubmitting }) => {
        try {
          setLoading(true);
          if (id) {
            const response = await getDirectConnectProvider(id, values);
          }
          setLoading(false);
        } catch (error) {
          console.error(error);
          setLoading(false);
        } finally {
          setLoading(false);
          onOpenChange();
        }
      }
    });

    return (
      <>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent
            className="max-w-lg top-[5%] lg:top-[15%] translate-y-0 [&>button]:top-8 [&>button]:end-7"
            ref={ref}
          >
            <form className="" onSubmit={formik.handleSubmit}>
              <DialogHeader className="py-4">
                <div className="flex flex-col gap-2">
                  <DialogTitle>{`Contact ${providerProfile?.name || ''}`}</DialogTitle>
                  <DialogDescription>{`${providerProfile?.name || ''} will reach out via your preferred contact method.`}</DialogDescription>
                </div>
              </DialogHeader>
              <DialogBody className="p-5 flex flex-col justify-center">
                <div className="grid gap-5 lg:gap-7.5 mx-auto w-full px-6">
                  <div className="flex flex-col justify-center gap-1">
                    <label className="form-label text-gray-900">Service</label>
                    <Select
                      value={formik.values.service_id}
                      onValueChange={(value) => {
                        const selectedService = providerProfile?.services_collection?.find(
                          (service: any) => service.id === value
                        );
                        formik.setFieldValue('service_id', value);
                        setSelectedServiceName(selectedService.name || 'Select Service');
                      }}
                    >
                      <SelectTrigger className="" size="sm">
                        {selectedServiceName}
                      </SelectTrigger>

                      <SelectContent className="">
                        {providerProfile?.services_collection?.map((service: any) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formik.errors.service_id && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {formik.errors.service_id}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900">Full Name</label>
                    <Input
                      type="text"
                      placeholder="John Smith"
                      size={'sm'}
                      {...formik.getFieldProps('first_name')}
                    />
                    {formik.touched.first_name && formik.errors.first_name && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {formik.errors.first_name}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900">Preferred Contact Method</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <Input
                          type="radio"
                          name="preferred_method"
                          value="email"
                          checked={formik.values.preferred_method === 'email'}
                          onChange={formik.handleChange}
                        />
                        Email
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <Input
                          type="radio"
                          name="preferred_method"
                          value="phone"
                          checked={formik.values.preferred_method === 'phone'}
                          onChange={formik.handleChange}
                        />
                        Phone
                      </label>
                    </div>
                  </div>

                  {formik.values.preferred_method === 'email' && (
                    <div className="flex flex-col gap-1">
                      <label className="form-label text-gray-900">Email</label>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        size={'sm'}
                        {...formik.getFieldProps('email')}
                      />
                      {formik.touched.email && formik.errors.email && (
                        <span role="alert" className="text-danger text-xs mt-1">
                          {formik.errors.email}
                        </span>
                      )}
                    </div>
                  )}
                  {formik.values.preferred_method === 'phone' && (
                    <div className="flex flex-col gap-1">
                      <label className="form-label text-gray-900">Phone</label>
                      <Input
                        type="text"
                        placeholder="0400 123 456"
                        size={'sm'}
                        {...formik.getFieldProps('phone')}
                      />
                      {formik.touched.phone && formik.errors.phone && (
                        <span role="alert" className="text-danger text-xs mt-1">
                          {formik.errors.phone}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </DialogBody>
              <DialogFooter className="flex justify-center">
                <button
                  type="submit"
                  className="btn btn-primary flex justify-center"
                  disabled={loading || formik.isSubmitting}
                >
                  {loading ? 'Please wait...' : 'Connect'}
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </>
    );
  }
);

export { ConnectProviderModal };
