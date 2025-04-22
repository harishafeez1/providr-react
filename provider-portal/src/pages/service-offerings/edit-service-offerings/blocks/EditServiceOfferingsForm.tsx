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
import PlacesAutocomplete from '@/components/google-places/placesAutocomplete';
import { Button } from '@/components/ui/button';
import {
  getSingleServiceOfferings,
  updateServiceOfferings
} from '@/services/api/service-offerings';

const EditServiceOfferingsForm = () => {
  const { currentUser } = useAuthContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const [offeringsData, setOfferingsData] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [servicesSelected, setServicesSelected] = useState<any>([]);
  const [ageGroups, setAgeGroups] = useState<number[]>([]);
  const [servicesDelevired, setServicesDelivered] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>(Object.keys(regions)[0]);
  const [progress, setProgress] = useState<number>(0);
  const [regionSelection, setRegionSelection] = useState<number>(0);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);

  const servicesSelectedFalse = servicesSelected.every(([_, value]: any) => value === false);
  const ageGroupsFalse = ageGroups.every(([_, value]: any) => value === false);

  useEffect(() => {
    if (id) {
      const fetchServiceOffering = async () => {
        try {
          const res = await getSingleServiceOfferings(id);
          if (res) {
            setIsLoading(false);
            setOfferingsData(res);
          }
        } catch (error) {
          console.error('Error fetching single service:', error);
        }
      };
      fetchServiceOffering();
    }
  }, [id]);

  useEffect(() => {
    // Function to calculate progress
    const calculateProgress = () => {
      let filledFields = 0;
      if (nameInput) filledFields++;
      if (!servicesSelectedFalse) filledFields++;
      if (servicesDelevired !== null) filledFields++;
      if (!ageGroupsFalse) filledFields++;
      if (regionSelection !== 0) filledFields++;
      setProgress((filledFields / 6) * 100);
    };

    calculateProgress();
  }, [nameInput, servicesDelevired, ageGroupsFalse, servicesSelectedFalse, regionSelection]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const serviceOfferingSchema = Yup.object().shape({
    // firstName: Yup.string()
    //   .min(3, 'Minimum 3 symbols')
    //   .max(50, 'Maximum 50 symbols')
    //   .required('First name is required'),
    // lastName: Yup.string().min(3, 'Minimum 3 symbols').max(50, 'Maximum 50 symbols'),
    // email: Yup.string()
    //   .email('Wrong email format')
    //   .min(3, 'Minimum 3 symbols')
    //   .max(50, 'Maximum 50 symbols')
    //   .required('Email is required'),
    // phone: Yup.string()
    //   .matches(/^\+?[0-9]+$/, 'Phone number must be digits only')
    //   .min(7, 'Minimum 7 digits')
    //   .max(15, 'Maximum 15 digits')
    //   .required('Phone number is required')
    // password: Yup.string()
    //   .min(3, 'Minimum 3 symbols')
    //   .max(50, 'Maximum 50 symbols')
    //   .required('Password is required')
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
    address_options: offeringsData ? offeringsData?.address_options || [] : ([] as string[]),
    service_available_options: offeringsData
      ? offeringsData?.service_available_options
      : ([] as string[])
  };

  const handleSubmit = async (values: any, { resetForm }: any) => {
    setLoading(true);
    try {
      const res = await updateServiceOfferings(id, values);
      if (res) {
        setLoading(false);
        resetForm();
        navigate('/');
      }
    } catch (error) {
      setLoading(false);
      console.error('service offring updating error:', error);
    }
  };

  const handlePlaceChange = (address: any, values: any, setFieldValue: any) => {
    setSelectedPlace(address);

    if (!values.address_options.includes(address?.label)) {
      const updatedAddresses = [...(values.address_options || []), address?.label];
      setFieldValue('address_options', updatedAddresses);
    }

    setSelectedPlace(null);
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
              {/* <div className="flex items-baseline flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1">
                  <KeenIcon icon="loading" className="text-sm" /> Select your service Your progress
                </label>
                <div className="progress w-[100%]">
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{ width: `${progress}%` }}
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
              </div> */}
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
                        setFieldValue('service_id', option.value),
                          setServicesDelivered(option.value);
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
                      setNameInput(e.target.value);
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
                        ),
                          setServicesDelivered(option.map((lang: any) => lang.value));
                      }}
                    />
                  )}
                </Field>
              </div>
              <div className="flex items-baseline flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1">
                  <KeenIcon icon="focus" className="text-sm" />
                  Where will this service be delivered from?
                </label>

                <div className="block w-full shadow-none outline-none font-medium leading-[1] bg-[var(--tw-light-active)] rounded-[0.375rem] h-auto px-[0.75rem] py-4 border border-[var(--tw-gray-300)] text-[var(--tw-gray-700)]">
                  {/* <label className="form-label max-w-70 gap-1 my-3">
                    <KeenIcon icon="subtitle" className="text-sm" />
                    Active Addresses:
                  </label> */}
                  <div className="py-2">
                    <label className="form-label max-w-70 gap-1 my-3">Select Addresses</label>
                    <Field name="address_options">
                      {({ field }: any) => (
                        <PlacesAutocomplete
                          {...field}
                          name="address_options"
                          value={selectedPlace}
                          onChange={(address) => handlePlaceChange(address, values, setFieldValue)}
                        />
                      )}
                    </Field>
                  </div>

                  <div className="my-4">
                    <strong className="py-6">List of Added Addresses:</strong>
                    <div className="py-2 flex flex-col">
                      {(values.address_options || []).map((option: string, index: number) => (
                        <div key={index} className="py-1 flex items-center gap-8">
                          <div className="badge badge-pill badge-primary badge-lg">{option}</div>
                          <div
                            className="badge badge-sm badge-danger badge-outline cursor-pointer rounded-full"
                            onClick={() => {
                              const updatedAddresses = values.address_options.filter(
                                (_: string, i: number) => i !== index
                              );
                              setFieldValue('address_options', updatedAddresses);
                            }}
                          >
                            ✖
                          </div>
                          {selectedPlace && selectedPlace.label === option && (
                            <div className="badge badge-pill badge-danger">
                              This address is already added
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {touched.address_options && errors.address_options && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {errors?.address_options as any}
                    </span>
                  )}
                </div>
              </div>
              <div className="block w-full shadow-none outline-none font-medium leading-[1] bg-[var(--tw-light-active)] rounded-[0.375rem] h-auto px-[0.75rem] py-4 border border-[var(--tw-gray-300)] text-[var(--tw-gray-700)]">
                {/* <div className=" w-full">
                  <div className="w-[30%]">
                    <label className="form-label">Location Limit: {regionSelection}/3</label>
                    <div className="progress w-[100%]">
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{ width: `${(regionSelection / maxSelectionLimit) * 100}%` }}
                        aria-valuenow={100}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      ></div>
                    </div>
                  </div>
                </div> */}
                <div className="tabs mb-5">
                  {Object.keys(regions).map((state) => (
                    <button
                      key={state}
                      type="button"
                      className={`tab ${activeTab === state ? 'active' : ''}`}
                      aria-selected={activeTab === state}
                      onClick={(event) => {
                        event.preventDefault();
                        handleTabClick(state);
                      }}
                    >
                      {state}
                    </button>
                  ))}
                </div>
                <div>
                  {Object.entries(regions).map(([state, regionList]: any) => (
                    <div key={state} className={activeTab === state ? '' : 'hidden'}>
                      <div className="grid grid-cols-2 gap-4">
                        {regionList.map((region: any, index: any) => {
                          // Count the total number of selected checkboxes
                          const selectedCount = Object.values(values.service_available_options)
                            .flatMap((regionState: any) => Object.values(regionState))
                            .filter(Boolean).length;
                          setRegionSelection(selectedCount);
                          return (
                            <label
                              key={index}
                              className={`checkbox-group cursor-pointer flex items-center gap-2 ${
                                selectedCount === 3 &&
                                !values.service_available_options[state]?.[region]
                                  ? 'opacity-50 cursor-not-allowed'
                                  : ''
                              }`}
                            >
                              <Field
                                type="checkbox"
                                className="checkbox checkbox-sm"
                                name={`service_available_options.${region}`}
                                checked={values.service_available_options.includes(region)}
                                onChange={() => {
                                  const isChecked =
                                    !values.service_available_options.includes(region);

                                  // Update the Formik field value
                                  setFieldValue(
                                    'service_available_options',
                                    isChecked
                                      ? [...values.service_available_options, region]
                                      : values.service_available_options.filter(
                                          (item: string) => item !== region
                                        ) // Remove the region
                                  );

                                  // regionally, update any other state if needed
                                  setAgeGroups((prev: any) => {
                                    const updated = isChecked
                                      ? [...prev, region]
                                      : prev.filter((item: any) => item !== region);
                                    return updated;
                                  });
                                }}
                              />

                              <span className="checkbox-label">{region}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
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
