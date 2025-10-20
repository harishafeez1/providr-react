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
import { forwardRef, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ClaimListing } from '@/services/api/profile';
import { toast } from 'sonner';

interface ClaimListingModalProps {
  open: boolean;
  onOpenChange: () => void;
  companyId: number;
}

const claimSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required')
    .min(3, 'Minimum 3 characters')
    .max(100, 'Maximum 100 characters')
});

const ClaimListingModal = forwardRef<HTMLDivElement, ClaimListingModalProps>(
  ({ open, onOpenChange, companyId }, ref) => {
    const [loading, setLoading] = useState(false);

    const formik = useFormik({
      initialValues: {
        email: ''
      },
      validationSchema: claimSchema,
      onSubmit: async (values, { setSubmitting, resetForm }) => {
        try {
          setLoading(true);
          const response = await ClaimListing({
            company_id: companyId,
            email: values.email
          });
          toast.success('Claim request submitted successfully! We will review your request.', {
            position: 'top-right'
          });
          resetForm();
          onOpenChange();
        } catch (error: any) {
          console.error('Error claiming listing:', error);
          toast.error(error?.response?.data?.message || 'Failed to submit claim request', {
            position: 'top-right'
          });
        } finally {
          setLoading(false);
          setSubmitting(false);
        }
      }
    });

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md" ref={ref}>
          <form onSubmit={formik.handleSubmit}>
            <DialogHeader className="py-4">
              <div className="flex flex-col gap-2">
                <DialogTitle>Claim This Listing</DialogTitle>
                <DialogDescription>
                  Submit your email to claim this business listing. Our system will analyze your
                  request and verify your ownership before approving the claim.
                </DialogDescription>
              </div>
            </DialogHeader>
            <DialogBody className="p-5 flex flex-col justify-center">
              <div className="flex flex-col gap-4 mx-auto w-full px-6">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">Email Address</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    size={'sm'}
                    {...formik.getFieldProps('email')}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.email}
                    </span>
                  )}
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-gray-700">
                  <p className="font-medium mb-1">What happens next?</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Our team will review your claim request</li>
                    <li>We may contact you to verify ownership</li>
                    <li>You'll receive an email notification about the status</li>
                  </ul>
                </div>
              </div>
            </DialogBody>
            <DialogFooter className="flex justify-center">
              <button
                type="submit"
                className="btn btn-primary flex justify-center"
                disabled={loading || formik.isSubmitting}
              >
                {loading ? 'Submitting...' : 'Submit Claim Request'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
);

export { ClaimListingModal };
