import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { geocodeByAddress, getLatLng } from 'react-google-places-autocomplete';

import { KeenIcon, ProgressBarLoader } from '@/components';
import { CustomSelect } from '@/components/select';
import { getSinglePremises, updatePremises } from '@/services/api';
import PlacesAutocomplete from '@/components/google-places/placesAutocomplete';

interface IEditPremisesForm {
  title: string;
}

interface PremisesData {
  id: string | number;
  name: string;
  active: string | number;
  address_line_1: string;
  address_line_2: string;
  suburb: string;
  state: string;
  post_code: string;
  latitude: string;
  longitude: string;
  phone: string;
  email: string;
  provider_company_id: string | number;
}

const EditPremisesForm = ({ title }: IEditPremisesForm) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [selectedActive, setSelectedActive] = useState('');
  const [selectedLongitude, setSelectedLongitude] = useState<number | ''>();
  const [selectedLatitude, setSelectedLatitude] = useState<number | ''>();
  const [selectedSuburb, setSelectedSuburb] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedPostCode, setSelectedPostCode] = useState('');
  const [premisesData, setPremisesData] = useState<PremisesData | null>(null);

  useEffect(() => {
    if (id) {
      const fetchPremises = async () => {
        try {
          const res = await getSinglePremises(id);
          if (res) {
            setLoading(false);
            setPremisesData(res);
          }
        } catch (error) {
          console.error('Error fetching premises:', error);
        }
      };
      fetchPremises();
    }
  }, [id]);

  const premisesSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    active: Yup.string().required('active is required'),
    address_line_1: Yup.string().required('address is required')
  });

  const activestate = [
    { value: '1', label: 'Yes' },
    { value: '0', label: 'No' }
  ];

  const initialValues = {
    name: premisesData ? premisesData?.name : selectedName,
    active: premisesData ? String(premisesData?.active) : selectedActive,
    // @ts-ignore
    address_line_1: premisesData ? premisesData.address_line_1 : selectedPlace?.value?.description,
    address_line_2: premisesData ? premisesData.address_line_2 : '',
    suburb: premisesData ? premisesData.suburb : selectedSuburb,
    state: premisesData ? premisesData.state : selectedState,
    post_code: premisesData ? premisesData.post_code : selectedPostCode,
    longitude: premisesData ? premisesData.longitude : selectedLongitude,
    latitude: premisesData ? premisesData.latitude : selectedLatitude,
    phone: premisesData ? premisesData.phone : '',
    email: premisesData ? premisesData.email : ''
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    const res = await updatePremises(id, values);
    if (res) {
      setLoading(false);
      navigate('/premises');
    }
  };

  const handlePlaceChange = async (address: any) => {
    setSelectedPlace(address);
    if (address) {
      const addressValue = await geocodeByAddress(address.label);
      const langLat = await getLatLng(addressValue[0]);
      const { lat, lng } = langLat;
      const longitude = lng ? lng : '';
      const latitude = lat ? lat : '';
      const addressComponents = addressValue[0].address_components;
      const postalCodeObj = addressComponents.find((component) =>
        component.types.includes('postal_code')
      );
      const postalCode = postalCodeObj ? postalCodeObj.long_name : '';
      const suburbObj = addressComponents.find((component) => component.types.includes('locality'));
      const suburb = suburbObj ? suburbObj.long_name : '';
      const stateObj = addressComponents.find((component) =>
        component.types.includes('administrative_area_level_1')
      );
      const state = stateObj ? stateObj.long_name : '';
      setSelectedPostCode(postalCode);
      setSelectedSuburb(suburb);
      setSelectedState(state);
      setSelectedLongitude(longitude);
      setSelectedLatitude(latitude);
    }
  };

  if (loading) {
    return <ProgressBarLoader />;
  }

  return (
    <>
      <Formik
        validationSchema={premisesSchema}
        initialValues={initialValues}
        enableReinitialize={true}
        onSubmit={(formData) => handleSubmit(formData)}
      >
        {({ setFieldValue, values, isSubmitting, touched, errors }) => (
          <Form>
            <div className="card-header" id="general_settings">
              <h3 className="card-title">{title}</h3>
            </div>
            <div className="card-body grid gap-5">
              <div className="flex items-baseline flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1">
                  <KeenIcon icon="user" className="text-sm" />
                  Name
                </label>
                <Field
                  className="input"
                  name="name"
                  type="text"
                  placeholder="Enter name"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFieldValue('name', e.target.value);
                    setSelectedName(e.target.value);
                  }}
                />
                {touched.name && errors.name && (
                  <span role="alert" className="text-danger text-xs mt-1">
                    {errors.name}
                  </span>
                )}
              </div>
              <div className="flex items-baseline flex-wrap gap-2.5">
                <label className="form-label max-w-56 gap-1">
                  <KeenIcon icon="flag" className="text-sm" />
                  Active
                </label>

                <Field name="active">
                  {({ field }: any) => (
                    <CustomSelect
                      {...field}
                      options={activestate}
                      value={values.active}
                      onChange={(option: any) => {
                        setFieldValue('active', option.value);
                        setSelectedActive(option.value);
                      }}
                    />
                  )}
                </Field>
                {touched.active && errors.active && (
                  <span role="alert" className="text-danger text-xs mt-1">
                    {errors.active}
                  </span>
                )}
              </div>
              <div className="flex items-baseline flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1">
                  <KeenIcon icon="geolocation" className="text-sm" />
                  Address Line 1
                </label>
                <Field name="address_line_1">
                  {({ field }: any) => (
                    <PlacesAutocomplete
                      {...field}
                      name="address_line_1"
                      value={selectedPlace}
                      onChange={handlePlaceChange}
                    />
                  )}
                </Field>
                {touched.address_line_1 && errors.address_line_1 && (
                  <span role="alert" className="text-danger text-xs mt-1">
                    {errors.address_line_1}
                  </span>
                )}
              </div>
              <div className="flex items-baseline flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1">
                  <KeenIcon icon="geolocation" className="text-sm" />
                  Address Line 2
                </label>
                <Field
                  className="input"
                  name="address_line_2"
                  type="text"
                  placeholder="Enter address"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFieldValue('address_line_2', e.target.value);
                  }}
                />
                {touched.address_line_2 && errors.address_line_2 && (
                  <span role="alert" className="text-danger text-xs mt-1">
                    {errors.address_line_2}
                  </span>
                )}
              </div>
              <div className="flex items-baseline flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1">
                  <KeenIcon icon="map" className="text-sm" />
                  Suburb
                </label>
                <Field
                  className="input"
                  name="suburb"
                  type="text"
                  placeholder=""
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFieldValue('suburb', e.target.value);
                  }}
                />
                {touched.suburb && errors.suburb && (
                  <span role="alert" className="text-danger text-xs mt-1">
                    {errors.suburb}
                  </span>
                )}
              </div>

              <div className="flex items-baseline flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1">
                  <KeenIcon icon="map" className="text-sm" />
                  State
                </label>
                <Field
                  className="input"
                  name="state"
                  type="text"
                  placeholder=""
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFieldValue('state', e.target.value);
                  }}
                />
                {touched.state && errors.state && (
                  <span role="alert" className="text-danger text-xs mt-1">
                    {errors.state}
                  </span>
                )}
              </div>
              <div className="flex items-baseline flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1">
                  <KeenIcon icon="map" className="text-sm" />
                  Postal Code
                </label>
                <Field
                  className="input"
                  name="post_code"
                  type="text"
                  placeholder="Enter code"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFieldValue('post_code', e.target.value);
                  }}
                />
                {touched.post_code && errors.post_code && (
                  <span role="alert" className="text-danger text-xs mt-1">
                    {errors.post_code}
                  </span>
                )}
              </div>
              <div className="flex items-baseline flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1">
                  <KeenIcon icon="geolocation" className="text-sm" />
                  Longitude
                </label>
                <Field
                  className="input"
                  name="longitude"
                  type="text"
                  placeholder=""
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFieldValue('longitude', e.target.value);
                  }}
                />
                {touched.longitude && errors.longitude && (
                  <span role="alert" className="text-danger text-xs mt-1">
                    {errors.longitude}
                  </span>
                )}
              </div>
              <div className="flex items-baseline flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1">
                  <KeenIcon icon="geolocation" className="text-sm" />
                  Latitude
                </label>
                <Field
                  className="input"
                  name="latitude"
                  type="text"
                  placeholder=""
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFieldValue('latitude', e.target.value);
                  }}
                />
                {touched.latitude && errors.latitude && (
                  <span role="alert" className="text-danger text-xs mt-1">
                    {errors.latitude}
                  </span>
                )}
              </div>
              <div className="flex items-baseline flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1">
                  <KeenIcon icon="phone" className="text-sm" />
                  Phone Number
                </label>
                <Field
                  className="input"
                  name="phone"
                  type="number"
                  placeholder="Enter phone number"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFieldValue('phone', e.target.value);
                  }}
                />
                {touched.phone && errors.phone && (
                  <span role="alert" className="text-danger text-xs mt-1">
                    {errors.phone}
                  </span>
                )}
              </div>
              <div className="flex items-baseline flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1">
                  <KeenIcon icon="sms" className="text-sm" />
                  Email
                </label>
                <Field
                  className="input"
                  name="email"
                  type="email"
                  placeholder="example@abc.com"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFieldValue('email', e.target.value);
                  }}
                />
                {touched.email && errors.email && (
                  <span role="alert" className="text-danger text-xs mt-1">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary flex justify-center"
                  disabled={isSubmitting}
                >
                  {'Save Changes'}
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
};

export { EditPremisesForm, type IEditPremisesForm };
