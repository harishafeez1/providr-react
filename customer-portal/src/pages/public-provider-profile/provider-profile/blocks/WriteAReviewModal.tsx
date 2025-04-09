import { CustomSelect, StarRating } from '@/components';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { forwardRef, useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getAuth, useAuthContext } from '@/auth';
import { postReview } from '@/services/api/reviews';

interface ReviewProps {
  open: boolean;
  onOpenChange: () => void;
  data: any;
}

const WriteAReviewModal = forwardRef<HTMLDivElement, ReviewProps>(
  ({ open, onOpenChange, data }, ref) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { auth, getUser, saveAuth, setCurrentUser, currentUser } = useAuthContext();

    const token = getAuth()?.token;

    useEffect(() => {
      if (getAuth()?.token) {
        getUser().then(() => {
          const auth = getAuth();
          saveAuth(auth);
          setCurrentUser(auth?.customer);
        });
      }
    }, [isLoggedIn]);
    const checkAuthKey = () => {
      const authToken = localStorage.getItem(import.meta.env.VITE_APP_NAME);
      setIsLoggedIn(!!authToken);
    };

    useEffect(() => {
      checkAuthKey();

      // Handle storage changes from other tabs/windows
      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === import.meta.env.VITE_APP_NAME) {
          checkAuthKey();
        }
      };

      // Add the storage event listener
      window.addEventListener('storage', handleStorageChange);

      // Cleanup the event listener on component unmount
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }, []);

    const initialValues = {
      rating: 0,
      content: '',
      service_offering_id: ''
    };

    const ReviewSchema = Yup.object().shape({
      rating: Yup.number().min(1, '* Rating is required')
    });

    const formik = useFormik({
      initialValues,
      validationSchema: ReviewSchema,
      onSubmit: async (values) => {
        if (isLoggedIn) {
          setLoading(true);
          const postObj = {
            ...values,
            customer_id: currentUser?.id,
            provider_company_id: data?.id
          };
          const res = await postReview(postObj);
          if (res) {
            setLoading(false);
            formik.resetForm();
            onOpenChange();
          }
        } else {
          formik.resetForm();
          setLoading(false);
        }
      }
    });

    const handleRating = (rating: number) => {
      formik.setFieldValue('rating', rating);
    };

    const options = data?.service_offerings?.map((item: any) => {
      return {
        value: item.id,
        label: item.service.name
      };
    });

    const handleLogin = () => {
      if (!token) {
        const width = 600;
        const height = 600;

        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const loginTab = window.open(
          '/login',
          '_blank',
          `width=${width},height=${height},top=${top},left=${left}`
        );

        if (!loginTab) {
          console.error('❌ Failed to open login tab. Make sure pop-ups are not blocked.');
          return;
        }
        window.addEventListener('message', (event) => {
          if (event.data === 'closeLogin' && loginTab) {
            loginTab.close();
          }
        });

        console.log('✅ Login tab opened. Waiting for authentication...');

        return;
      }
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl ">
          <form onSubmit={formik.handleSubmit}>
            <DialogTitle></DialogTitle>
            <DialogHeader className="text-lg font-bold">Review</DialogHeader>
            <div className="flex flex-col justify-center flex-wrap p-4">
              <div className="my-4">
                <div className="form-label mb-2">Please select a service:</div>
                <CustomSelect
                  options={options || []}
                  value={formik.values.service_offering_id}
                  onChange={(obj: any) => {
                    formik.setFieldValue('service_offering_id', obj.value);
                  }}
                />
              </div>
              <div className="mb-4">
                <div className="form-label mb-2">Please rate your experience:</div>
                <StarRating onRatingChange={handleRating} initialRating={0} />
                {formik.errors.rating && (
                  <span role="alert" className="text-danger text-xs mt-1">
                    {formik.errors.rating}
                  </span>
                )}
              </div>
              <div className="form-label mb-2">Please tell us about your experience:</div>
              <Textarea
                placeholder="Write a review..."
                className="h-40"
                value={formik.values.content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  formik.setFieldValue('content', e.target.value)
                }
              />
              <div className="flex justify-center mt-4">
                {isLoggedIn ? (
                  <Button type="submit" disabled={formik.values.rating === 0 || loading}>
                    {loading ? 'Submitting' : 'Submit'}
                  </Button>
                ) : (
                  <Button onClick={handleLogin}>Login</Button>
                )}
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
);

export { WriteAReviewModal };
