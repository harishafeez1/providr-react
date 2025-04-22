import { Formik, Form, Field } from 'formik';
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
      setFieldValue('business_logo', '');
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
    business_logo: '',
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
    formData.append('company_email', values.company_email);
    formData.append('company_phone', values.company_phone);
    formData.append('company_website', values.company_website);
    formData.append('description', values.description);
    formData.append('facebook_url', values.facebook_url);
    formData.append('instagram_url', values.instagram_url);
    formData.append('linkedin_url', values.linkedin_url);
    formData.append('organisation_type', values.organisation_type);
    formData.append('registered_for_ndis', values.registered_for_ndis);
    formData.append(
      'registered_for_ndis_early_childhood',
      values.registered_for_ndis_early_childhood
    );
    formData.append('twitter_url', values.twitter_url);

    if (values.business_logo) {
      formData.append('business_logo', values.business_logo);
    }

    // Append each file in the photo_gallery array
    if (values.photo_gallery && values.photo_gallery.length > 0) {
      values.photo_gallery.forEach((file: any) => {
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
    <>
      <Formik enableReinitialize={true} initialValues={initialValues} onSubmit={handleSubmit}>
        {({ setFieldValue, values, isSubmitting }) => (
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
                    value={values.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('name', e.target.value);
                    }}
                  />
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
                    type="Number"
                    placeholder="00 000 000 000"
                    value={values.abn}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('abn', e.target.value);
                    }}
                  />
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
                    onChange={(value) => {
                      setFieldValue('description', value);
                    }}
                  />
                </div>
                {/* <Field
                    name="description"
                    type="textarea"
                    placeholder="Enter a short description"
                    value={values.description}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('description', e.target.value);
                    }}
                  /> */}
              </div>
              <div className="grid gap-2.5 ">
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
                        <span className="">Sole Trader</span>
                        <Field
                          className="appearance-none"
                          name="organisation_type"
                          type="radio"
                          value="sole_trader"
                          checked={values.organisation_type === 'sole_trader'}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setFieldValue('organisation_type', e.target.value);
                          }}
                        />
                      </div>
                    </label>
                    <label
                      className={`input ${values.organisation_type === 'company' ? 'bg-blue-100' : ''}`}
                    >
                      <div className="flex flex-col place-items-center justify-center rounded-xl grow">
                        <span className="">Company</span>
                        <Field
                          className="appearance-none"
                          name="organisation_type"
                          type="radio"
                          value="company"
                          checked={values.organisation_type === 'company'}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setFieldValue('organisation_type', e.target.value);
                          }}
                        />
                      </div>
                    </label>
                    {/* {items.map((item: any, index: number) => {
                      return renderItem(item, index);
                    })} */}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7.5">
                <div className="grid gap-2.5 ">
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
                          <span className="">Yes</span>
                          <Field
                            className="appearance-none"
                            name="registered_for_ndis"
                            type="radio"
                            value="1"
                            checked={values.registered_for_ndis === '1'}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              setFieldValue('registered_for_ndis', e.target.value);
                            }}
                          />
                        </div>
                      </label>

                      <label
                        className={`input ${values.registered_for_ndis === '0' ? 'bg-blue-100' : ''}`}
                      >
                        <div className="flex flex-col place-items-center place-content-center rounded-xl grow">
                          <span className="">No</span>
                          <Field
                            className="appearance-none"
                            name="registered_for_ndis"
                            type="radio"
                            value="0"
                            checked={values.registered_for_ndis === '0'}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              setFieldValue('registered_for_ndis', e.target.value);
                            }}
                          />
                        </div>
                      </label>

                      {/* {items2.map((item: any, index: number) => {
                        return renderItem2(item, index);
                      })} */}
                    </div>
                  </div>
                </div>
                <div className="grid gap-2.5 ">
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
                          <span className="">Yes</span>
                          <Field
                            className="appearance-none"
                            name="registered_for_ndis_early_childhood"
                            type="radio"
                            value="1"
                            checked={values.registered_for_ndis_early_childhood === '1'}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              setFieldValue('registered_for_ndis_early_childhood', e.target.value);
                            }}
                          />
                        </div>
                      </label>

                      <label
                        className={`input ${values.registered_for_ndis_early_childhood === '0' ? 'bg-blue-100' : ''}`}
                      >
                        <div className="flex flex-col place-items-center place-content-center rounded-xl grow">
                          <span className="">No</span>
                          <Field
                            className="appearance-none"
                            name="registered_for_ndis_early_childhood"
                            type="radio"
                            value="0"
                            checked={values.registered_for_ndis_early_childhood === '0'}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              setFieldValue('registered_for_ndis_early_childhood', e.target.value);
                            }}
                          />
                        </div>
                      </label>

                      {/* {items2.map((item: any, index: number) => {
                        return renderItem3(item, index);
                      })} */}
                    </div>
                  </div>
                </div>
              </div>
              <Separator />
              <label className="label">Information Displayed on The Profile (Optional)</label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7.5">
                <div className="flex items-baseline flex-wrap gap-2.5">
                  <div className="flex w-max gap-1">
                    <KeenIcon icon="phone" className="text-md" />
                    <label className="form-label">Company Phone Number</label>
                  </div>
                  {/* <Alert className="h-[30px]" textSize="[10px]" variant="warning">
                    Please upgrade your subscription for this feature.
                  </Alert> */}
                  <label className="input">
                    <Field
                      name="company_phone"
                      type="number"
                      placeholder="Enter your phone number"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFieldValue('company_phone', e.target.value);
                      }}
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFieldValue('company_email', e.target.value);
                      }}
                    />
                  </label>
                </div>
              </div>
              <div className="flex items-baseline flex-wrap gap-2.5">
                <label className="form-label gap-1">
                  <KeenIcon icon="icon" className="text-sm" />
                  Company website
                </label>

                {/* <Alert className="h-[30px]" textSize="[10px]" variant="warning">
                  Please upgrade your subscription for this feature.
                </Alert> */}
                <label className="input">
                  <Field
                    name="company_website"
                    type="text"
                    placeholder="Enter your website URL"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('company_website', e.target.value);
                    }}
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
                  {/* <Alert className="h-[30px]" textSize="[10px]" variant="warning">
                    Please upgrade your subscription for this feature.
                  </Alert> */}
                  <label className="input">
                    <Field
                      name="facebook_url"
                      type="text"
                      placeholder="https://www.facebook.com/your-company"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFieldValue('facebook_url', e.target.value);
                      }}
                    />
                  </label>
                </div>
                <div className="flex items-baseline flex-wrap gap-2.5">
                  <label className="form-label max-w-70 gap-1">
                    <KeenIcon icon="behance" className="text-sm" /> Select your service LinkedIn URL
                  </label>

                  {/* <Alert className="h-[30px]" textSize="[10px]" variant="warning">
                    Please upgrade your subscription for this feature.
                  </Alert> */}
                  <label className="input">
                    <Field
                      name="linkedin_url"
                      type="text"
                      placeholder="https://www.linkedin.com/company/your-company"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFieldValue('linkedin_url', e.target.value);
                      }}
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
                  {/* <Alert className="h-[30px]" textSize="[10px]" variant="warning">
                    Please upgrade your subscription for this feature.
                  </Alert> */}
                  <label className="input">
                    <Field
                      name="instagram_url"
                      type="text"
                      placeholder="https://www.instagram.com/your-company"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFieldValue('instagram_url', e.target.value);
                      }}
                    />
                  </label>
                </div>
                <div className="flex items-baseline flex-wrap gap-2.5">
                  <label className="form-label max-w-70 gap-1">
                    <KeenIcon icon="twitter" className="text-sm" /> Select your service Twitter URL
                  </label>
                  {/* <Alert className="h-[30px]" textSize="[10px]" variant="warning">
                    Please upgrade your subscription for this feature.
                  </Alert> */}
                  <label className="input">
                    <Field
                      name="twitter_url"
                      type="text"
                      placeholder="https://www.twitter.com/your-company"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFieldValue('twitter_url', e.target.value);
                      }}
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
                {/* <Alert className="h-[30px]" textSize="[10px]" variant="warning">
                  Please upgrade your subscription for this feature.
                </Alert> */}
                <div className="block w-full shadow-none outline-none font-medium leading-[1] bg-[var(--tw-light-active)] rounded-[0.375rem] h-auto px-[0.75rem] py-4 border border-[var(--tw-gray-300)] text-[var(--tw-gray-700)]">
                  <CrudMultiImageUpload
                    onChange={(image) => handleImagesChange(image, setFieldValue)}
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

export { AddCompanyProfileForm };
