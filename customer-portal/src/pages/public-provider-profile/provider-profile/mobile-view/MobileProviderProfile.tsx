import { Separator } from '@/components/ui/separator';
import { BannerImgSection } from './BannerImgSection';
import { MobileProfileInfo } from './MobileProfileInfo';
import { MobileServicesSection } from './MobileServicesSection';
import { MobileQualifications } from './MobileQualifications';
import { MobileMyPortfolio } from './MobileMyPortfolio';
import { MobileReviews } from './MobileReviews';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ConnectProviderModal } from '../blocks';
import { ProviderMap } from '../blocks/ProviderMap';
import { MobileAgeGroups } from './MobileAgeGroups';
import { BottomSheetDialog } from '@/components';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import SafeGooglePlacesAutocomplete from '@/components/SafeGooglePlacesAutocomplete';
import { useParams } from 'react-router';
import { useAppSelector } from '@/redux/hooks';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getDirectConnectProvider } from '@/services/api/provider-profile';

const MobileProviderProfile = () => {
  const initialValues = {
    service_id: '',
    service_offering_id: '',
    first_name: '',
    last_name: '',
    description: '',
    address: '',
    zip_code: '',
    gender: '',
    age_group_options: '',
    service_delivered_options: '',
    preferred_method: 'email',
    email: '',
    phone: ''
  };

  const contactSchema = Yup.object().shape({
    service_offering_id: Yup.string().required('Service is required'),
    first_name: Yup.string().required('First Name is required'),
    address: Yup.string().required('Address is required'),
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalchange = () => {
    setIsModalOpen(!isModalOpen);
  };

  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [prefferedMethod, setPreferredMethod] = useState('');
  const [selectedServiceName, setSelectedServiceName] = useState('Select Service');
  const { providerProfile } = useAppSelector((state: any) => state.serviceRequest);

  const formik = useFormik({
    initialValues,
    validationSchema: contactSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      const selectedService = providerProfile?.services_collection?.find(
        (offering: any) => String(offering.id) === String(values.service_offering_id)
      );

      const dataObj = { ...values, service_id: selectedService?.service_id };

      try {
        setLoading(true);
        if (id) {
          const response = await getDirectConnectProvider(id, dataObj);
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      } finally {
        setLoading(false);
        handleModalchange();
      }
    }
  });

  return (
    <>
      <div className="grid grid-cols-12 font-montserrat">
        <BottomSheetDialog open={isModalOpen} onOpenChange={handleModalchange} className="h-[95vh]">
          <div className="max-h-[95vh] overflow-y-auto">
            <form className="" onSubmit={formik.handleSubmit}>
              <div className="py-4">
                <div className="flex items-center flex-col gap-2">
                  <div className="font-semibold">{`Contact ${providerProfile?.name || ''}`}</div>
                  <div className="text-[#6c6c6c] text-xs">{`${providerProfile?.name || ''} will reach out via your preferred contact method.`}</div>
                </div>
              </div>
              <div className="p-5 flex flex-col justify-center">
                <div className="grid gap-5 lg:gap-7.5 mx-auto w-full px-6">
                  <div className="flex flex-col justify-center gap-1">
                    <label className="form-label text-gray-900">Service</label>
                    <Select
                      value={formik.values.service_offering_id}
                      onValueChange={(value) => {
                        const selectedService = providerProfile?.services_collection?.find(
                          (service: any) => String(service.id) === String(value)
                        );
                        formik.setFieldValue('service_offering_id', value);
                        if (selectedService) {
                          setSelectedServiceName(selectedService.display_name || 'Select Service');
                        }
                      }}
                    >
                      <SelectTrigger className="" size="sm">
                        {selectedServiceName}
                      </SelectTrigger>

                      <SelectContent className="">
                        {providerProfile?.services_collection?.map((service: any) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.display_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formik.errors.service_offering_id && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {formik.errors.service_offering_id}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900">Short Description</label>
                    <Textarea
                      name="description"
                      placeholder="Tell us about your service request"
                      onChange={(e) => formik.setFieldValue('description', e.target.value)}
                    />
                    {formik.touched.description && formik.errors.description && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {formik.errors.description}
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
                    <label className="form-label text-gray-900">Gender</label>
                    <Select
                      onValueChange={(gender) => formik.setFieldValue('gender', gender)}
                      defaultValue={''}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">MALE</SelectItem>
                        <SelectItem value="female">FEMALE</SelectItem>
                        <SelectItem value="others">OTHERS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900">Address</label>
                    <SafeGooglePlacesAutocomplete
                      apiKey={import.meta.env.VITE_APP_GOOGLE_API_KEY}
                      onLoadFailed={(err) => {
                        console.error('Could not load google places autocomplete', err);
                      }}
                      autocompletionRequest={{
                        componentRestrictions: { country: 'au' },
                        types: ['(regions)']
                      }}
                      apiOptions={{ region: 'AU' }}
                      selectProps={{
                        isClearable: true,
                        placeholder: 'Search for a place',
                        onChange: (loc) => {
                          formik.setFieldValue('address', loc?.label);
                        },
                        styles: {
                          control: (base, state) => ({
                            ...base,
                            borderColor: state.isFocused ? '#752C84' : '#d1d5db',
                            boxShadow: 'none',
                            fontSize: '0.875rem',
                            minHeight: '2rem',
                            '&:hover': { borderColor: '#752C84' }
                          }),
                          placeholder: (base) => ({
                            ...base,
                            fontSize: '0.775rem',
                            color: '#9ca3af'
                          }),
                          option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isFocused ? '#752C84' : 'white',
                            color: state.isFocused ? 'white' : 'black',
                            fontSize: '0.775rem',
                            cursor: 'pointer'
                          }),
                          menu: (base) => ({
                            ...base,
                            boxShadow: 'none'
                          }),
                          singleValue: (base) => ({
                            ...base,
                            color: 'black'
                          })
                        }
                      }}
                    />
                    {formik.errors.address && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {formik.errors.address}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900">Postal Code</label>
                    <Input
                      type="text"
                      placeholder=""
                      size={'sm'}
                      {...formik.getFieldProps('zip_code')}
                    />
                    {formik.touched.zip_code && formik.errors.zip_code && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {formik.errors.zip_code}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col justify-center gap-1">
                    <label className="form-label text-gray-900">Age groups</label>
                    <Select
                      value={formik.values.age_group_options || ''}
                      onValueChange={(value) => {
                        formik.setFieldValue('age_group_options', value);
                      }}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <span>{formik.values.age_group_options || 'Select Age Group'}</span>
                      </SelectTrigger>
                      <SelectContent className="">
                        {providerProfile?.services_collection?.[0]?.age_group_options?.map(
                          (group: string) => (
                            <SelectItem key={group} value={group} className="text-sm">
                              {group}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    {formik.errors.age_group_options && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {formik.errors.age_group_options}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col justify-center gap-1">
                    <label className="form-label text-gray-900">Access Method</label>
                    <Select
                      value={formik.values.service_delivered_options || ''}
                      onValueChange={(value) => {
                        formik.setFieldValue('service_delivered_options', value);
                      }}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <span>
                          {formik.values.service_delivered_options || 'Select Access Method'}
                        </span>
                      </SelectTrigger>
                      <SelectContent className="">
                        {providerProfile?.services_collection?.[0]?.service_delivered_options?.map(
                          (group: string) => (
                            <SelectItem key={group} value={group} className="text-sm">
                              {group}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    {formik.errors.service_delivered_options && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {formik.errors.service_delivered_options}
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
              </div>
              <div className="flex justify-center pb-8">
                <button
                  type="submit"
                  className="btn btn-primary flex justify-center"
                  disabled={loading || formik.isSubmitting}
                >
                  {loading ? 'Please wait...' : 'Connect'}
                </button>
              </div>
            </form>
          </div>
        </BottomSheetDialog>

        <div className="col-span-12 text-black">
          <div className="relative ">
            <BannerImgSection />
          </div>
          <div className="card bg-white -mt-[100px] shadow-lg px-6 sticky top-[168px] rounded-[32px] pb-8 contain-layout w-screen ">
            <div className="mb-2">
              <MobileProfileInfo />
            </div>
            <Separator className="my-4" />
            <div className="mt-2">
              <MobileServicesSection />
            </div>
            <Separator className="my-3" />
            <div className="mt-3">
              <MobileQualifications />
              <Button
                className="w-full mt-8 font-semibold text-black bg-[#F2F2F2] hover:bg-[#F7F7F7] transition"
                onClick={handleModalchange}
              >
                Connect with provider
              </Button>
            </div>
            <Separator className="mt-6" />
            <div className="">
              <MobileMyPortfolio />
            </div>
            <Separator className="my-4" />
            <div className="mt-2">
              <MobileReviews />
            </div>
            {providerProfile?.premises && providerProfile.premises.length > 0 && (
              <>
                <Separator className="mt-6" />
                <div className="">
                  <ProviderMap premises={providerProfile.premises} />
                </div>
                <Separator className="my-6" />
              </>
            )}
            <div className="">
              <MobileAgeGroups />
            </div>
          </div>
          <div className="h-[200px]"></div>
        </div>
      </div>
    </>
  );
};

export { MobileProviderProfile };
