import { Formik, Form, Field, ErrorMessage } from 'formik';
import React, { useState } from 'react';
import { KeenIcon } from '@/components';
import { Separator } from '@/components/ui/separator';
import { CrudAvatarUpload } from '@/partials/crud';
import { CrudMultiImageUpload } from '@/partials/crud/CrudMultiImageUpload';
import type { IImageInputFile } from '@/components/image-input';
import axios from 'axios';
import { UPDATE_COMPANY_PROFILE_URL } from '@/services/endpoints';
import { useAuthContext } from '@/auth';
import { Editor } from '../../../../components/editor/Editor';
import * as Yup from 'yup';
import { ProgressBar } from '../ProgressBar';

// ABN Lookup API validation
const validateABN = async (abn: string, guid: string) => {
  if (!abn || !guid) return false;
  try {
    const response = await axios.get('https://abr.business.gov.au/json/AbnDetails.aspx', {
      params: { abn, guid }
    });
    return response.data.Message === ''; // Empty message indicates valid ABN
  } catch (error) {
    console.error('ABN validation failed:', error);
    return false;
  }
};

const stripHtml = (html: string) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

// Yup validation schema
const validationSchema = Yup.object({
  // business_logo: Yup.mixed()
  //   .nullable()
  //   .test('fileType', 'Logo must be a JPEG or PNG', (value) => {
  //     if (!value) return true;
  //     return ['image/jpeg', 'image/png'].includes(value.type);
  //   })
  //   .test('fileSize', 'Logo must be less than 5MB', (value) => {
  //     if (!value) return true;
  //     return value.size <= 5 * 1024 * 1024; // 5MB
  //   }),
  name: Yup.string()
    .min(1, 'Business name must be at least 1 character')
    .max(100, 'Business name must be 100 characters or less')
    .required('Business name is required'),
  abn: Yup.string()
    .matches(/^\d{11}$/, 'ABN must be exactly 11 digits')
    .required('ABN is required'),
  // .test('valid-abn', 'Invalid ABN', async (value) => {
  //   if (!value || !/^\d{11}$/.test(value)) return false;
  //   // Replace with your actual ABN Lookup GUID
  //   return await validateABN(value, 'your-guid-here');
  // })
  description: Yup.string()
    .required('Description is required')
    .max(3000, 'Description must not exceed 3000 characters')
    .test('min-text-length', 'Description must be at least 100 characters', (value) => {
      if (!value) return false;
      const text = stripHtml(value);
      return text.length >= 100;
    })
    .test('max-word-count', 'Description must not exceed 300 words', (value) => {
      if (!value) return true;
      const text = stripHtml(value);
      const wordCount = text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
      return wordCount <= 300;
    }),
  organisation_type: Yup.string()
    .oneOf(['sole_trader', 'company'], 'Invalid organisation type')
    .required('Organisation type is required'),
  registered_for_ndis: Yup.string()
    .oneOf(['0', '1'], 'Please select an option')
    .required('NDIS registration status is required'),
  registered_for_ndis_early_childhood: Yup.string()
    .oneOf(['0', '1'], 'Please select an option')
    .required('NDIS Early Childhood registration status is required'),
  company_phone: Yup.string()
    .required('Phone number is required')
    .matches(/^\+?\d{8,12}$/, {
      message: 'Phone number must be 8–12 digits (no spaces)',
      excludeEmptyString: true
    }),
  company_email: Yup.string().required('Email is required').email('Invalid email address'),
  company_website: Yup.string()
    .required('Website is required')
    .url('Invalid URL (must include https://)'),
  facebook_url: Yup.string()
    .nullable()
    .matches(/^https:\/\/(www\.)?facebook\.com\/.+$/, {
      message: 'Must be a valid Facebook URL',
      excludeEmptyString: true
    }),
  linkedin_url: Yup.string()
    .nullable()
    .matches(/^https:\/\/(www\.)?linkedin\.com\/.+$/, {
      message: 'Must be a valid LinkedIn URL',
      excludeEmptyString: true
    }),
  instagram_url: Yup.string()
    .nullable()
    .matches(/^https:\/\/(www\.)?instagram\.com\/.+$/, {
      message: 'Must be a valid Instagram URL',
      excludeEmptyString: true
    }),
  twitter_url: Yup.string()
    .nullable()
    .matches(/^https:\/\/(www\.)?(twitter|x)\.com\/.+$/, {
      message: 'Must be a valid Twitter/X URL',
      excludeEmptyString: true
    })
  // photo_gallery: Yup.array()
  //   .nullable()
  //   .of(
  //     Yup.mixed()
  //       .test('fileType', 'Images must be JPEG or PNG', (value) => {
  //         if (!value) return true;
  //         return ['image/jpeg', 'image/png'].includes(value.type);
  //       })
  //       .test('fileSize', 'Each image must be less than 5MB', (value) => {
  //         if (!value) return true;
  //         return value.size <= 5 * 1024 * 1024; // 5MB
  //       })
  //   )
  //   .max(5, 'Maximum 5 images allowed'),
});

const AddCompanyProfileForm = () => {
  const { currentUser, getUser, setCurrentCompany, setCurrentUser } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = (
    image: IImageInputFile[],
    setFieldValue: (field: string, value: any) => void
  ) => {
    if (image.length > 0) {
      setFieldValue('business_logo', image[0].file);
    } else {
      setFieldValue('business_logo', null);
    }
  };

  const handleImagesChange = (
    newImages: IImageInputFile[],
    setFieldValue: (field: string, value: any) => void
  ) => {
    const binaryFiles = newImages.map((image) => image.file);
    setFieldValue('photo_gallery', binaryFiles);
  };

  const initialValues = {
    business_logo: currentUser?.provider_company?.business_logo || null,
    name: currentUser?.provider_company?.name || '',
    abn: currentUser?.provider_company?.abn || '',
    description: currentUser?.provider_company?.description || '',
    organisation_type: currentUser?.provider_company?.organisation_type || 'sole_trader',
    registered_for_ndis: currentUser?.provider_company?.registered_for_ndis ? '1' : '0',
    registered_for_ndis_early_childhood: currentUser?.provider_company
      ?.registered_for_ndis_early_childhood
      ? '1'
      : '0',
    company_phone: currentUser?.provider_company?.company_phone || '',
    company_email: currentUser?.provider_company?.company_email || '',
    company_website: currentUser?.provider_company?.company_website || '',
    facebook_url: currentUser?.provider_company?.facebook_url || '',
    linkedin_url: currentUser?.provider_company?.linkedin_url || '',
    instagram_url: currentUser?.provider_company?.instagram_url || '',
    twitter_url: currentUser?.provider_company?.twitter_url || '',
    photo_gallery: currentUser?.provider_company?.photo_gallery || []
  };

  const handleSubmit = async (values: any) => {
    const formData = new FormData();

    formData.append('abn', values.abn);
    formData.append('name', values.name);
    formData.append('company_email', values.company_email || '');
    formData.append('company_phone', values.company_phone || '');
    formData.append('company_website', values.company_website || '');
    formData.append('description', values.description);
    formData.append('facebook_url', values.facebook_url || '');
    formData.append('instagram_url', values.instagram_url || '');
    formData.append('linkedin_url', values.linkedin_url || '');
    formData.append('organisation_type', values.organisation_type);
    formData.append('registered_for_ndis', values.registered_for_ndis);
    formData.append(
      'registered_for_ndis_early_childhood',
      values.registered_for_ndis_early_childhood
    );
    formData.append('twitter_url', values.twitter_url || '');

    if (typeof values.business_logo !== 'string') {
      formData.append('business_logo', values.business_logo);
    }

    if (values.photo_gallery && values.photo_gallery.length > 0) {
      values.photo_gallery.forEach((file: File) => {
        if (file instanceof File) {
          formData.append('photo_gallery[]', file);
        }
      });
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${UPDATE_COMPANY_PROFILE_URL}/${currentUser?.provider_company_id}`,
        formData
      );
      setCurrentCompany(res?.data);
      const user = await getUser();
      setCurrentUser(user?.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Upload failed:', error);
    }
  };

  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      validate={(values) => {
        const errors: any = {};
        if (values.description) {
          const text = stripHtml(values.description);
          const wordCount = text
            .trim()
            .split(/\s+/)
            .filter((word) => word.length > 0).length;
          if (values.description.length > 3000) {
            errors.description = 'Description must not exceed 3000 characters';
          } else if (wordCount > 300) {
            errors.description = 'Description must not exceed 300 words';
          }
        }
        return errors;
      }}
    >
      {({ setFieldValue, values, isSubmitting, errors, touched }) => (
        <>
          <ProgressBar />

          <Form className="card p-4">
            <div className="grid gap-5">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center flex-col gap-2.5 flex-2 justify-center mx-auto">
                  <CrudAvatarUpload
                    onChange={(image) => handleAvatarChange(image, setFieldValue)}
                  />
                  <label className="flex justify-start items-center gap-1.5">
                    <KeenIcon icon="picture" className="text-md" />
                    Upload your business logo
                  </label>
                  <span className="text-2sm font-medium text-gray-600">
                    150x150px JPEG, PNG Image
                  </span>
                  <p className="text-xs text-destructive">
                    * Image size should not be more than 5MB
                  </p>
                  <ErrorMessage
                    name="business_logo"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
              </div>
              <div className="flex items-baseline flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1">
                  <KeenIcon icon="text" className="text-sm" />
                  Name of your business
                </label>
                <label className="input">
                  <Field
                    name="name"
                    type="text"
                    placeholder="Enter your business name"
                    className={`input-field ${errors.name && touched.name ? 'border-red-500' : ''}`}
                  />
                  <ErrorMessage name="name" component="div" className="text-red-500 text-xs mt-1" />
                </label>
              </div>
              <div className="flex items-baseline flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1">
                  <KeenIcon icon="shop" className="text-sm" /> ABN
                </label>
                <p className="text-2sm text-gray-700">
                  <a
                    href="https://abr.business.gov.au/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-500 text-xs"
                  >
                    <span className="text-danger mx-2">*</span>
                    <span>Find your ABN here.</span>
                    <span className="text-danger mx-2">(numbers only)</span>
                  </a>
                </p>
                <label className="input">
                  <Field
                    name="abn"
                    type="text"
                    placeholder="00000000000"
                    maxLength={11}
                    className={`input-field ${errors.abn && touched.abn ? 'border-red-500' : ''}`}
                  />
                  <ErrorMessage name="abn" component="div" className="text-red-500 text-xs mt-1" />
                </label>
              </div>
              <div className="flex items-baseline flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1">
                  <KeenIcon icon="subtitle" className="text-sm" />
                  Write a short company introduction that will appear on your public profile
                </label>
                <p className="text-2sm text-gray-700">
                  This description is what visitors will see when they first land on your profile.
                  Briefly explain who you are, what services you provide, and what makes your
                  business unique. Keep it clear and friendly — like you're introducing your
                  business to someone for the first time.
                </p>
                <div className="w-full">
                  <Editor
                    className="h-80"
                    value={values.description}
                    onChange={(value) => setFieldValue('description', value)}
                  />
                  {errors.description && (
                    <div className="text-red-500 text-xs mt-1">{errors.description}</div>
                  )}
                </div>
              </div>
              <div className="grid gap-2.5">
                <label className="form-label max-w-70 gap-1">
                  <KeenIcon icon="briefcase" className="text-sm" />
                  What is your organisation type?
                </label>
                <div className="block w-full shadow-none outline-none font-medium leading-[1] bg-[var(--tw-light-active)] rounded-[0.375rem] h-auto px-[0.75rem] py-4 border border-[var(--tw-gray-300)] text-[var(--tw-gray-700)]">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7.5">
                    <label
                      className={`input ${values.organisation_type === 'sole_trader' ? 'bg-blue-100' : ''}`}
                    >
                      <div className="flex flex-col place-items-center justify-center rounded-xl grow">
                        <span>Sole Trader</span>
                        <Field
                          className="appearance-none"
                          name="organisation_type"
                          type="radio"
                          value="sole_trader"
                        />
                      </div>
                    </label>
                    <label
                      className={`input ${values.organisation_type === 'company' ? 'bg-blue-100' : ''}`}
                    >
                      <div className="flex flex-col place-items-center justify-center rounded-xl grow">
                        <span>Company</span>
                        <Field
                          className="appearance-none"
                          name="organisation_type"
                          type="radio"
                          value="company"
                        />
                      </div>
                    </label>
                  </div>
                  <ErrorMessage
                    name="organisation_type"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7.5">
                <div className="grid gap-2.5">
                  <label className="form-label max-w-70 gap-1">
                    <KeenIcon icon="question" className="text-md" />
                    Are you registered for NDIS?
                  </label>
                  <p className="text-2sm text-gray-700">
                    You don't need to be registered for NDIS to be listed on Providr hub.
                  </p>
                  <div className="block w-full shadow-none outline-none font-medium leading-[1] bg-[var(--tw-light-active)] rounded-[0.375rem] h-auto px-[0.75rem] py-4 border border-[var(--tw-gray-300)] text-[var(--tw-gray-700)]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7.5">
                      <label
                        className={`input ${values.registered_for_ndis === '1' ? 'bg-blue-100' : ''}`}
                      >
                        <div className="flex flex-col place-items-center place-content-center rounded-xl grow">
                          <span>Yes</span>
                          <Field
                            className="appearance-none"
                            name="registered_for_ndis"
                            type="radio"
                            value="1"
                          />
                        </div>
                      </label>
                      <label
                        className={`input ${values.registered_for_ndis === '0' ? 'bg-blue-100' : ''}`}
                      >
                        <div className="flex flex-col place-items-center place-content-center rounded-xl grow">
                          <span>No</span>
                          <Field
                            className="appearance-none"
                            name="registered_for_ndis"
                            type="radio"
                            value="0"
                          />
                        </div>
                      </label>
                    </div>
                    <ErrorMessage
                      name="registered_for_ndis"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                </div>
                <div className="grid gap-2.5">
                  <label className="form-label max-w-70 gap-1">
                    <KeenIcon icon="question" className="text-md" />
                    Are you registered for NDIS Early Childhood?
                  </label>
                  <p className="text-2sm text-gray-700">
                    You don't need to be registered to be listed on Providr hub.
                  </p>
                  <div className="block w-full shadow-none outline-none font-medium leading-[1] bg-[var(--tw-light-active)] rounded-[0.375rem] h-auto px-[0.75rem] py-4 border border-[var(--tw-gray-300)] text-[var(--tw-gray-700)]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7.5">
                      <label
                        className={`input ${values.registered_for_ndis_early_childhood === '1' ? 'bg-blue-100' : ''}`}
                      >
                        <div className="flex flex-col place-items-center place-content-center rounded-xl grow">
                          <span>Yes</span>
                          <Field
                            className="appearance-none"
                            name="registered_for_ndis_early_childhood"
                            type="radio"
                            value="1"
                          />
                        </div>
                      </label>
                      <label
                        className={`input ${values.registered_for_ndis_early_childhood === '0' ? 'bg-blue-100' : ''}`}
                      >
                        <div className="flex flex-col place-items-center place-content-center rounded-xl grow">
                          <span>No</span>
                          <Field
                            className="appearance-none"
                            name="registered_for_ndis_early_childhood"
                            type="radio"
                            value="0"
                          />
                        </div>
                      </label>
                    </div>
                    <ErrorMessage
                      name="registered_for_ndis_early_childhood"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                </div>
              </div>
              <Separator />
              <label className="label">Information Displayed on The Profile</label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7.5">
                <div className="flex items-baseline flex-wrap gap-2.5">
                  <div className="flex w-max gap-1">
                    <KeenIcon icon="phone" className="text-md" />
                    <label className="form-label">Company Phone Number</label>
                  </div>
                  <label className="input">
                    <Field
                      name="company_phone"
                      type="text"
                      placeholder="Enter your phone number"
                      className={`input-field ${errors.company_phone && touched.company_phone ? 'border-red-500' : ''}`}
                    />
                    <ErrorMessage
                      name="company_phone"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </label>
                </div>
                <div className="flex items-baseline flex-wrap gap-2.5">
                  <label className="form-label max-w-70 gap-1">
                    <KeenIcon icon="sms" className="text-sm" /> Company Email
                  </label>
                  <label className="input">
                    <Field
                      name="company_email"
                      type="email"
                      placeholder="Enter your email"
                      className={`input-field ${errors.company_email && touched.company_email ? 'border-red-500' : ''}`}
                    />
                    <ErrorMessage
                      name="company_email"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </label>
                </div>
              </div>
              <div className="flex items-baseline flex-wrap gap-2.5">
                <label className="form-label gap-1">
                  <KeenIcon icon="icon" className="text-sm" />
                  Company website
                </label>
                <label className="input">
                  <Field
                    name="company_website"
                    type="url"
                    placeholder="Enter your website URL"
                    className={`input-field ${errors.company_website && touched.company_website ? 'border-red-500' : ''}`}
                  />
                  <ErrorMessage
                    name="company_website"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </label>
              </div>
              <Separator />
              <label className="label">Social Media Presence (Optional)</label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7.5">
                <div className="flex items-baseline flex-wrap gap-2.5">
                  <label className="form-label max-w-70 gap-1">
                    <KeenIcon icon="facebook" className="text-sm" /> Select your service Facebook
                    URL
                  </label>
                  <label className="input">
                    <Field
                      name="facebook_url"
                      type="text"
                      placeholder="https://www.facebook.com/your-company"
                      className={`input-field ${errors.facebook_url && touched.facebook_url ? 'border-red-500' : ''}`}
                    />
                    <ErrorMessage
                      name="facebook_url"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </label>
                </div>
                <div className="flex items-baseline flex-wrap gap-2.5">
                  <label className="form-label max-w-70 gap-1">
                    <KeenIcon icon="behance" className="text-sm" /> Select your service LinkedIn URL
                  </label>
                  <label className="input">
                    <Field
                      name="linkedin_url"
                      type="text"
                      placeholder="https://www.linkedin.com/company/your-company"
                      className={`input-field ${errors.linkedin_url && touched.linkedin_url ? 'border-red-500' : ''}`}
                    />
                    <ErrorMessage
                      name="linkedin_url"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7.5">
                <div className="flex items-baseline flex-wrap gap-2.5">
                  <label className="form-label max-w-70 gap-1">
                    <KeenIcon icon="instagram" className="text-sm" /> Select your service Instagram
                    URL
                  </label>
                  <label className="input">
                    <Field
                      name="instagram_url"
                      type="text"
                      placeholder="https://www.instagram.com/your-company"
                      className={`input-field ${errors.instagram_url && touched.instagram_url ? 'border-red-500' : ''}`}
                    />
                    <ErrorMessage
                      name="instagram_url"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </label>
                </div>
                <div className="flex items-baseline flex-wrap gap-2.5">
                  <label className="form-label max-w-70 gap-1">
                    <KeenIcon icon="twitter" className="text-sm" /> Select your service Twitter URL
                  </label>
                  <label className="input">
                    <Field
                      name="twitter_url"
                      type="text"
                      placeholder="https://www.twitter.com/your-company"
                      className={`input-field ${errors.twitter_url && touched.twitter_url ? 'border-red-500' : ''}`}
                    />
                    <ErrorMessage
                      name="twitter_url"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </label>
                </div>
              </div>
              <Separator />
              <label className="label">
                <KeenIcon icon="picture" className="text-sm" /> Media (Optional)
              </label>
              <div className="flex items-baseline flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1">Photo Gallery</label>
                <div className="block w-full shadow-none outline-none font-medium leading-[1] bg-[var(--tw-light-active)] rounded-[0.375rem] h-auto px-[0.75rem] py-4 border border-[var(--tw-gray-300)] text-[var(--tw-gray-700)]">
                  <CrudMultiImageUpload
                    onChange={(image) => handleImagesChange(image, setFieldValue)}
                  />
                  <ErrorMessage
                    name="photo_gallery"
                    component="div"
                    className="text-red-500 text-xs mt-1"
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
        </>
      )}
    </Formik>
  );
};

export { AddCompanyProfileForm };
