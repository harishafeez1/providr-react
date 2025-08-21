import { Formik, Form, Field } from 'formik';
import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';

import {
  regions,
  options,
  options1,
  languages,
  services
} from '../../add-service-offerings/blocks/data';
import { CustomSelect } from '@/components/select';
import { KeenIcon, ProgressBarLoader } from '@/components';
import { useAuthContext } from '@/auth';
import { Switch } from '@/components/ui/switch';
import { useNavigate, useParams } from 'react-router';
import {
  getSingleServiceOfferings,
  updateServiceOfferings
} from '@/services/api/service-offerings';
import EditMapboxLocationSelector from './EditMapboxLocationSelector';
import { ProgressBar } from '@/pages/company-profile/add-company-profile/ProgressBar';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  setServiceOfferingData,
  resetServiceOffering
} from '@/redux/slices/service-offering-slice';

const EditServiceOfferingsForm = () => {
  const { currentUser } = useAuthContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { currentOffering, locations } = useAppSelector((state) => state.serviceOffering);
  const [offeringsData, setOfferingsData] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [servicesSelected, setServicesSelected] = useState<any>([]);
  const [ageGroups, setAgeGroups] = useState<number[]>([]);

  useEffect(() => {
    if (id) {
      const fetchServiceOffering = async () => {
        try {
          const res = await getSingleServiceOfferings(id);
          if (res) {
            setIsLoading(false);
            setOfferingsData(res);

            // Set the data in Redux with service_available_options
            dispatch(
              setServiceOfferingData({
                ...res,
                id,
                service_available_options: res.service_available_options || []
              })
            );
          }
        } catch (error) {
          console.error('Error fetching single service:', error);
        }
      };
      fetchServiceOffering();
    }
  }, [id, dispatch]);

  const serviceOfferingSchema = Yup.object().shape({
    service_id: Yup.string().required('Service is required'),
    description: Yup.string().required('description is required'),
    language_options: Yup.array().of(Yup.string()).min(1, 'At least one language is required'),
    age_group_options: Yup.array().of(Yup.string()).min(1, 'At least one age group is required'),
    service_delivered_options: Yup.array().of(Yup.string()).min(1, 'Service delivered are required')
  });

  const initialValues = {
    active: offeringsData ? offeringsData?.active : false,
    service_id: offeringsData ? offeringsData?.service_id : Number,
    language_options: offeringsData ? offeringsData?.language_options : ([] as string[]),
    description: offeringsData ? offeringsData?.description : '',
    service_delivered_options: offeringsData
      ? offeringsData?.service_delivered_options
      : ([] as string[]),
    age_group_options: offeringsData ? offeringsData?.age_group_options : ([] as string[]),
    service_available_options: locations // Use locations from Redux
  };

  const handleSubmit = async (values: any, { resetForm }: any) => {
    setLoading(true);
    try {
      // Get the latest locations from Redux
      const submissionData = {
        ...values,
        service_available_options: locations // Use locations from Redux
      };

      const res = await updateServiceOfferings(id, submissionData);
      if (res) {
        setLoading(false);
        resetForm();
        dispatch(resetServiceOffering()); // Reset Redux state
      }
    } catch (error) {
      setLoading(false);
      console.error('service offering updating error:', error);
    }
  };

  const handleCheckAll = (values: any, setFieldValue: any) => {
    const allChecked = values.age_group_options.length === options1.length;
    const newValue = allChecked ? [] : [...options1];

    // Update Formik field
    setFieldValue('age_group_options', newValue);
  };

  if (isLoading) {
    return <ProgressBarLoader />;
  }

  return (
    <>
      <Formik
        validationSchema={serviceOfferingSchema}
        initialValues={initialValues}
        enableReinitialize={true}
        onSubmit={(formData, { resetForm, setFieldValue }) =>
          handleSubmit(formData, { resetForm, setFieldValue })
        }
      >
        {({ setFieldValue, values, isSubmitting, touched, errors }) => (
          // console.log('---values----', values),
          <Form className="card p-4">
            <div className="grid gap-5">
              <div className="flex items-baseline flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1">
                  <KeenIcon icon="loading" className="text-sm" />
                  Your progress
                </label>
                <div className="progress w-[100%]">
                  <ProgressBar />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active-mode"
                  name="active"
                  defaultChecked={values.active}
                  onCheckedChange={(checked: boolean) => {
                    setFieldValue('active', checked);
                  }}
                />
                <label htmlFor="active-mode" className="font-medium cursor-pointer">
                  Active
                </label>
              </div>
              <div className="flex flex-col items-baseline flex-wrap gap-2.5">
                <label className="form-label max-w-56 gap-1">
                  <KeenIcon icon="delivery-3" className="text-sm" /> Select your service
                </label>
                <Field name="services">
                  {({ field }: any) => (
                    <CustomSelect
                      {...field}
                      options={services}
                      value={values.service_id}
                      onChange={(option: any) => {
                        setFieldValue('service_id', option.value);
                      }}
                    />
                  )}
                </Field>
              </div>
              <div className="flex items-baseline flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1">
                  <KeenIcon icon="subtitle" className="text-sm" />
                  Write a short description of this specific service
                </label>
                <label className="input">
                  <Field
                    name="description"
                    type="text"
                    placeholder="Enter some text"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('description', e.target.value);
                    }}
                  />
                </label>
              </div>
              <div className="flex items-baseline flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1">
                  <KeenIcon icon="pointers" className="text-sm" />
                  How is this service delivered?
                </label>
                <div className="block w-full shadow-none outline-none font-medium leading-[1] bg-[var(--tw-light-active)] rounded-[0.375rem] h-auto px-[0.75rem] py-4 border border-[var(--tw-gray-300)] text-[var(--tw-gray-700)]">
                  <div className="grid grid-cols-2 gap-4">
                    {options.map((option: any, index: any) => (
                      <label
                        key={index}
                        className="checkbox-group flex items-center gap-2 cursor-pointer"
                      >
                        <Field
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          name="service_delivered_options"
                          checked={values.service_delivered_options.includes(option)}
                          onChange={() => {
                            const isChecked = !values.service_delivered_options.includes(option);

                            // Update the Formik field value
                            setFieldValue(
                              'service_delivered_options',
                              isChecked
                                ? [...values.service_delivered_options, option]
                                : values.service_delivered_options.filter(
                                    (item: string) => item !== option
                                  ) // Remove the option
                            );

                            // Optionally, update any other state if needed
                            setServicesSelected((prev: string[]) => {
                              const updated = isChecked
                                ? [...prev, option]
                                : prev.filter((item) => item !== option);
                              return updated;
                            });
                          }}
                        />
                        <span className="checkbox-label">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-baseline flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1">
                  <KeenIcon icon="people" className="text-sm" />
                  Which age groups are supported?
                </label>
                <div className="block w-full shadow-none outline-none font-medium leading-[1] bg-[var(--tw-light-active)] rounded-[0.375rem] h-auto px-[0.75rem] py-4 border border-[var(--tw-gray-300)] text-[var(--tw-gray-700)]">
                  <div className="grid grid-cols-2 gap-4">
                    {options1.map((option: any, index: any) => (
                      <label
                        key={index}
                        className="checkbox-group flex items-center gap-2 cursor-pointer"
                      >
                        <Field
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          name={`age_group_options.${option}`}
                          checked={values.age_group_options.includes(option)}
                          onChange={() => {
                            const isChecked = !values.age_group_options.includes(option);

                            // Update the Formik field value
                            setFieldValue(
                              'age_group_options',
                              isChecked
                                ? [...values.age_group_options, option]
                                : values.age_group_options.filter((item: string) => item !== option) // Remove the option
                            );

                            // Optionally, update any other state if needed
                            setAgeGroups((prev: any) => {
                              const updated = isChecked
                                ? [...prev, option]
                                : prev.filter((item: any) => item !== option);
                              return updated;
                            });
                          }}
                        />
                        <span className="checkbox-label">{option}</span>
                      </label>
                    ))}
                    <label className="checkbox-group flex items-center gap-2 cursor-pointer mb-2">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={values.age_group_options.length === options1.length}
                        onChange={() => handleCheckAll(values, setFieldValue)}
                      />
                      <span className="checkbox-label">Check All</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex items-baseline flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1">
                  <KeenIcon icon="text" className="text-sm" />
                  In what languages is this service available?
                </label>

                <Field name="language_options">
                  {({ field }: any) => (
                    <CustomSelect
                      {...field}
                      isMulti
                      options={languages}
                      value={values.language_options.map((lang: any) => lang)}
                      onChange={(option: any) => {
                        setFieldValue(
                          'language_options',
                          option.map((lang: any) => lang.value)
                        );
                      }}
                    />
                  )}
                </Field>
              </div>

              <div className="flex items-baseline flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1">
                  <KeenIcon icon="geolocation" className="text-sm" />
                  Select Service Area
                </label>
                <div className="block w-full shadow-none outline-none font-medium leading-[1] bg-[var(--tw-light-active)] rounded-[0.375rem] h-auto px-[0.75rem] py-4 border border-[var(--tw-gray-300)] text-[var(--tw-gray-700)]">
                  <EditMapboxLocationSelector
                    accessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary flex justify-center"
                  disabled={loading || isSubmitting}
                >
                  {loading ? 'Please wait...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
};

export { EditServiceOfferingsForm };
