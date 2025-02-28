import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import clsx from 'clsx';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { updateProfile } from '@/services/api/profile';

interface IModalDeleteConfirmationProps {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
}

const FilterModal = ({ open, onClose }: IModalDeleteConfirmationProps) => {
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
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="w-full  max-w-[500px]">
          <DialogHeader className="justify-between border-0 pt-5">
            <DialogTitle>Filters</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <DialogBody className="flex flex-col max-h-[450px] xl:max-h-[650px]  items-center scrollable-y-auto">
            <div className="grid gap-2">
              <form onSubmit={formik.handleSubmit} noValidate>
                <div className="grid gap-5">
                  <h3 className="text-lg font-semibold ">Location</h3>
                  <div className="flex items-baseline flex-wrap  gap-2.5 mb-4">
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

                  <h3 className="text-lg font-semibold">Service</h3>
                  <div className="flex items-baseline flex-wrap  gap-2.5 mb-4">
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

                  <h3 className="text-lg font-semibold">NDIS Register</h3>
                  <div className="flex items-baseline flex-wrap  gap-2.5 mb-4">
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

                  <h3 className="text-lg font-semibold">Age Group</h3>
                  <div className="flex items-baseline flex-wrap  gap-2.5 mb-4">
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

                  <h3 className="text-lg font-semibold">Service type</h3>
                  <div className="flex items-baseline flex-wrap  gap-2.5 mb-4">
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

                  <h3 className="text-lg font-semibold">Insurance Type</h3>
                  <div className="flex items-baseline flex-wrap  gap-2.5 mb-4">
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
                </div>
              </form>
            </div>
          </DialogBody>
          <DialogFooter className="justify-end">
            <button className="btn btn-primary">Apply</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { FilterModal };
