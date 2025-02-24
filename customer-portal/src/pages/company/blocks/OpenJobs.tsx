import clsx from 'clsx';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { updateProfile } from '@/services/api/profile';
import { Accordion, AccordionItem } from '@/components/accordion';

interface IOpenJobsItem {
  icon: string;
  link: string;
  desc: string;
  price: string;
}
interface IOpenJobsItems extends Array<IOpenJobsItem> {}

const OpenJobs = () => {
  const profileSchema = Yup.object().shape({
    location: Yup.string(),
    service: Yup.string().required('Last name is required'),
    phone: Yup.string().required('Phone number is required'),
    dob: Yup.date().required('Date of birth is required'),
    ndis_number: Yup.string().required('NDIS number is required'),
    ndis_plan_type: Yup.string().required('NDIS type is required'),
    ndis_plan_date: Yup.string().required('NDIS plan date is required'),
    email: Yup.string()
      .email('Wrong email format')
      .min(3, 'Minimum 3 symbols')
      .max(50, 'Maximum 50 symbols')
      .required('Email is required')
  });
  const initialValues = {
    location: '',
    service: '',
    phone: '',
    dob: '',
    ndis_number: '',
    ndis_plan_type: '',
    ndis_plan_date: '',
    email: '',
    password: ''
  };
  const formik = useFormik({
    initialValues,
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      await updateProfile(values);
    }
  });
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Filters</h3>
      </div>

      <div className="card-body">
        <div className="grid gap-2">
          <form onSubmit={formik.handleSubmit} noValidate>
            <div className="grid gap-5">
              <Accordion allowMultiple={true}>
                <AccordionItem key="1" title="Location">
                  <div className="flex items-baseline flex-wrap  gap-2.5">
                    <label className="input">
                      <input
                        placeholder="Enter Location"
                        autoComplete="off"
                        {...formik.getFieldProps('location')}
                        className={clsx('form-control', {
                          'is-invalid': formik.touched.location && formik.errors.location
                        })}
                      />
                    </label>
                    {formik.touched.location && formik.errors.location && (
                      <span role="alert" className="text-danger text-xs">
                        {formik.errors.location}
                      </span>
                    )}
                  </div>
                </AccordionItem>
                <AccordionItem key="2" title="Service">
                  <div className="flex items-baseline flex-wrap  gap-2.5">
                    <label className="input">
                      <input
                        placeholder="Enter Service"
                        autoComplete="off"
                        {...formik.getFieldProps('service')}
                        className={clsx('form-control', {
                          'is-invalid': formik.touched.service && formik.errors.service
                        })}
                      />
                    </label>
                    {formik.touched.service && formik.errors.service && (
                      <span role="alert" className="text-danger text-xs">
                        {formik.errors.service}
                      </span>
                    )}
                  </div>
                </AccordionItem>
                <AccordionItem key="3" title="NDIS Registration">
                  <div className="flex items-baseline flex-wrap  gap-2.5">
                    <div className="input flex">
                      <label className="flex checkbox checkbox-sm gap-1">
                        <input type="checkbox" value="1" name="check2" readOnly />
                        <span className="switch-label">NDIS Registered</span>
                      </label>
                    </div>
                    <div className="input flex">
                      <label className="flex checkbox checkbox-sm gap-1">
                        <input type="checkbox" value="1" name="check" readOnly />
                        <span className="switch-label">NDIS Early Childhood Registered</span>
                      </label>
                    </div>

                    {formik.touched.phone && formik.errors.phone && (
                      <span role="alert" className="text-danger text-xs">
                        {formik.errors.phone}
                      </span>
                    )}
                  </div>
                </AccordionItem>
                <AccordionItem key="4" title="Age Group">
                  <div className="flex items-baseline flex-wrap  gap-2.5">
                    <div className="input flex">
                      <label className="flex radio radio-sm gap-1">
                        <input
                          className=""
                          name="desktop_notification"
                          type="radio"
                          value="1"
                          readOnly
                        />
                        <span className="switch-label">Early Childhood (0-7 years)</span>
                      </label>
                    </div>
                    <div className="input flex">
                      <label className="flex radio radio-sm gap-1">
                        <input
                          className=""
                          name="desktop_notification"
                          type="radio"
                          value="2"
                          readOnly
                        />
                        <span className="switch-label">Children (8-16 years)</span>
                      </label>
                    </div>
                    <div className="input flex">
                      <label className="flex radio radio-sm gap-1">
                        <input
                          className=""
                          name="desktop_notification"
                          type="radio"
                          value="3"
                          readOnly
                        />
                        <span className="switch-label">Young people (17-21 years)</span>
                      </label>
                    </div>
                    <div className="input flex">
                      <label className="flex radio radio-sm gap-1">
                        <input
                          className=""
                          name="desktop_notification"
                          type="radio"
                          value="4"
                          readOnly
                        />
                        <span className="switch-label">Adults (22-59 years)</span>
                      </label>
                    </div>
                    <div className="input flex">
                      <label className="flex radio radio-sm gap-1">
                        <input
                          className=""
                          name="desktop_notification"
                          type="radio"
                          value="5"
                          readOnly
                        />
                        <span className="switch-label">Mature Age (60+ years)</span>
                      </label>
                    </div>
                  </div>
                </AccordionItem>
                <AccordionItem key="5" title="Access Methode">
                  <div className="flex items-baseline flex-wrap  gap-2.5">
                    <div className="input flex">
                      <label className="flex radio radio-sm gap-1">
                        <input className="" name="access_methode" type="radio" value="1" readOnly />
                        <span className="switch-label">Group</span>
                      </label>
                    </div>
                    <div className="input flex">
                      <label className="flex radio radio-sm gap-1">
                        <input className="" name="access_methode" type="radio" value="2" readOnly />
                        <span className="switch-label">Online Service</span>
                      </label>
                    </div>
                    <div className="input flex">
                      <label className="flex radio radio-sm gap-1">
                        <input className="" name="access_methode" type="radio" value="3" readOnly />
                        <span className="switch-label">Telehealth</span>
                      </label>
                    </div>
                    <div className="input flex">
                      <label className="flex radio radio-sm gap-1">
                        <input className="" name="access_methode" type="radio" value="4" readOnly />
                        <span className="switch-label">We come to you</span>
                      </label>
                    </div>
                    <div className="input flex">
                      <label className="flex radio radio-sm gap-1">
                        <input className="" name="access_methode" type="radio" value="5" readOnly />
                        <span className="switch-label">You come to us</span>
                      </label>
                    </div>
                  </div>
                </AccordionItem>
                <AccordionItem key="6" title="Specialisation">
                  <div className="flex items-baseline flex-wrap  gap-2.5">
                    <div className="input flex">
                      <label className="flex checkbox checkbox-sm gap-1">
                        <input type="checkbox" value="1" name="check2" readOnly />
                        <span className="switch-label">Aboriginal and Torres Strait Islander</span>
                      </label>
                    </div>
                    <div className="input flex">
                      <label className="flex checkbox checkbox-sm gap-1">
                        <input type="checkbox" value="1" name="check" readOnly />
                        <span className="switch-label">Acquired Brain Injury</span>
                      </label>
                    </div>
                    <div className="input flex">
                      <label className="flex checkbox checkbox-sm gap-1">
                        <input type="checkbox" value="1" name="check2" readOnly />
                        <span className="switch-label">Autism</span>
                      </label>
                    </div>
                    <div className="input flex">
                      <label className="flex checkbox checkbox-sm gap-1">
                        <input type="checkbox" value="1" name="check" readOnly />
                        <span className="switch-label">CALD</span>
                      </label>
                    </div>
                    <div className="input flex">
                      <label className="flex checkbox checkbox-sm gap-1">
                        <input type="checkbox" value="1" name="check2" readOnly />
                        <span className="switch-label">Intellectual Disability</span>
                      </label>
                    </div>
                    <div className="input flex">
                      <label className="flex checkbox checkbox-sm gap-1">
                        <input type="checkbox" value="1" name="check" readOnly />
                        <span className="switch-label">LGBTIQ+</span>
                      </label>
                    </div>
                    <div className="input flex">
                      <label className="flex checkbox checkbox-sm gap-1">
                        <input type="checkbox" value="1" name="check2" readOnly />
                        <span className="switch-label">Psychosocial Disability</span>
                      </label>
                    </div>
                    <div className="input flex">
                      <label className="flex checkbox checkbox-sm gap-1">
                        <input type="checkbox" value="1" name="check" readOnly />
                        <span className="switch-label">Sensory Impairment</span>
                      </label>
                    </div>

                    {formik.touched.phone && formik.errors.phone && (
                      <span role="alert" className="text-danger text-xs">
                        {formik.errors.phone}
                      </span>
                    )}
                  </div>
                </AccordionItem>
              </Accordion>
            </div>
          </form>
        </div>
      </div>

      <div className="card-footer justify-center">
        <button
          type="submit"
          className="btn btn-primary flex justify-center"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? 'Please wait...' : 'Apply'}
        </button>
      </div>
    </div>
  );
};

export { OpenJobs, type IOpenJobsItem, type IOpenJobsItems };
