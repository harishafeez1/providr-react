import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { useCreate[Entity] } from './[Component]Data';
import { toast } from 'sonner';

/**
 * Validation Schema
 *
 * Define validation rules using Yup
 */
const validationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(3, 'Name must be at least 3 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^\d{10}$/, 'Phone must be 10 digits')
    .nullable(),
  status: Yup.string()
    .oneOf(['active', 'inactive'], 'Invalid status')
    .required('Status is required'),
  description: Yup.string()
    .max(500, 'Description must be less than 500 characters'),
});

/**
 * Type Definitions
 */
interface I[Entity]FormValues {
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive';
  description?: string;
}

interface [Component]FormProps {
  initialValues?: Partial<I[Entity]FormValues>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * [Component]Form Component
 *
 * Form component for creating/editing [entity description].
 * Uses Formik for form state management and Yup for validation.
 */
const [Component]Form = ({
  initialValues,
  onSuccess,
  onCancel,
}: [Component]FormProps) => {
  const createMutation = useCreate[Entity]();

  // Default initial values
  const defaultValues: I[Entity]FormValues = {
    name: '',
    email: '',
    phone: '',
    status: 'active',
    description: '',
    ...initialValues,
  };

  // Handle form submission
  const handleSubmit = async (
    values: I[Entity]FormValues,
    { setSubmitting, resetForm }
  ) => {
    try {
      await createMutation.mutateAsync(values);
      toast.success('[Entity] created successfully!');
      resetForm();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create [entity]');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ errors, touched, isSubmitting, values }) => (
        <Form className="space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name *
            </label>
            <Field name="name" as={Input} placeholder="Enter name" />
            {errors.name && touched.name && (
              <div className="text-danger text-sm mt-1">{errors.name}</div>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email *
            </label>
            <Field
              name="email"
              type="email"
              as={Input}
              placeholder="Enter email"
            />
            {errors.email && touched.email && (
              <div className="text-danger text-sm mt-1">{errors.email}</div>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone
            </label>
            <Field
              name="phone"
              type="tel"
              as={Input}
              placeholder="Enter phone number"
            />
            {errors.phone && touched.phone && (
              <div className="text-danger text-sm mt-1">{errors.phone}</div>
            )}
          </div>

          {/* Status Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status *
            </label>
            <Field name="status" as="select" className="form-select w-full">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Field>
            {errors.status && touched.status && (
              <div className="text-danger text-sm mt-1">{errors.status}</div>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <Field
              name="description"
              as="textarea"
              rows={4}
              className="form-textarea w-full"
              placeholder="Enter description (optional)"
            />
            {errors.description && touched.description && (
              <div className="text-danger text-sm mt-1">
                {errors.description}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="light"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || createMutation.isPending}
            >
              {isSubmitting || createMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <KeenIcon icon="check" className="ki-filled" />
                  Save
                </>
              )}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export { [Component]Form };
