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
import React, { forwardRef, useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getAuth, useAuthContext } from '@/auth';
import {
  postReview,
  validateInvitationToken,
  submitTokenReview,
  sendSmsVerification
} from '@/services/api/reviews';
import { PhoneVerificationModal } from './PhoneVerificationModal';
import { useParams } from 'react-router';

interface ReviewProps {
  open: boolean;
  onOpenChange: () => void;
  data: any;
}

interface VerifiedUserInfo {
  phone: string;
  email: string;
  displayName: string;
}

const WriteAReviewModal = forwardRef<HTMLDivElement, ReviewProps>(
  ({ open, onOpenChange, data }, ref) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [invitationToken, setInvitationToken] = useState<string | null>(null);
    const [showPhoneVerification, setShowPhoneVerification] = useState(false);
    const [smsSent, setSmsSent] = useState(false);
    const [verifiedUserInfo, setVerifiedUserInfo] = useState<VerifiedUserInfo | null>(null);
    const [tokenValidated, setTokenValidated] = useState(false);
    const { auth, getUser, saveAuth, setCurrentUser, currentUser } = useAuthContext();

    const token = getAuth()?.token;

    const removeInvitationTokenFromUrl = () => {
      const url = new URL(window.location.href);
      url.searchParams.delete('invitation_token');
      window.history.replaceState(null, '', url.toString());
    };

    // Extract invitation token from URL on component mount
    useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('invitation_token');
      setInvitationToken(tokenFromUrl);
    }, []);

    const { id } = useParams();

    useEffect(() => {
      if (invitationToken && !tokenValidated) {
        validateInvitationToken({ provider_company_id: id, token: invitationToken })
          .then((response) => {
            if (response.valid) {
              setTokenValidated(true);
            } else {
              removeInvitationTokenFromUrl();
              setInvitationToken(null);
              setTokenValidated(false);
            }
          })
          .catch((error) => {
            removeInvitationTokenFromUrl();
            setInvitationToken(null);
            setTokenValidated(false);
          });
      }
    }, [invitationToken]);

    useEffect(() => {
      setIsLoggedIn(!!token);
    }, [token]);

    const initialValues = {
      rating: 0,
      content: '',
      service_offering_id: ''
    };

    const ReviewSchema = Yup.object().shape({
      service_offering_id: Yup.string().required('* Service is Required'),
      rating: Yup.number().min(1, '* Rating is required')
    });

    const formik = useFormik({
      initialValues,
      validationSchema: ReviewSchema,
      onSubmit: async (values) => {
        setLoading(true);
        try {
          if (invitationToken && verifiedUserInfo) {
            const tokenReviewData = {
              token: invitationToken,
              phone: verifiedUserInfo.phone,
              email: verifiedUserInfo.email,
              rating: values.rating,
              content: values.content,
              service_offering_id: values.service_offering_id
                ? parseInt(values.service_offering_id)
                : undefined
            };
            await submitTokenReview(tokenReviewData);
            removeInvitationTokenFromUrl();
            setInvitationToken(null);
            formik.resetForm();
            setVerifiedUserInfo(null);
            onOpenChange();
          } else if (isLoggedIn) {
            const postObj = {
              ...values,
              customer_id: currentUser?.id,
              provider_company_id: data?.id
            };
            await postReview(postObj);
            formik.resetForm();
            onOpenChange();
          }
        } catch (error) {
          console.error('Error submitting review:', error);
        } finally {
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

    const handleWriteReview = async () => {
      if (invitationToken) {
        // For invitation token flow, always need phone verification
        if (!verifiedUserInfo) {
          // If user is logged in with phone, send SMS directly
          if (isLoggedIn && currentUser?.phone) {
            setLoading(true);
            try {
              await sendSmsVerification(invitationToken, currentUser.phone);
              setSmsSent(true);
              setShowPhoneVerification(true);
            } catch (error) {
              console.error('Error sending SMS:', error);
            } finally {
              setLoading(false);
            }
          } else {
            // User needs to provide info first
            setShowPhoneVerification(true);
          }
        }
      } else {
        // For non-invitation flow, redirect to login
        handleLogin();
      }
    };

    const handleVerificationSuccess = (userInfo: VerifiedUserInfo) => {
      setVerifiedUserInfo(userInfo);
      setShowPhoneVerification(false);
    };

    const canSubmitReview = () => {
      if (invitationToken) {
        return !!verifiedUserInfo;
      }
      return isLoggedIn;
    };

    const shouldShowReviewForm = () => {
      // Only show review form if invitation token exists AND user is verified
      if (invitationToken) {
        const shouldShow = !!verifiedUserInfo;
        return shouldShow;
      }
      return false;
    };

    const needsPhoneVerification = () => {
      if (!invitationToken) return false;
      if (isLoggedIn && currentUser?.phone) {
        // Logged in with phone - still need SMS verification for invitation token
        return !verifiedUserInfo;
      }
      // Not logged in or logged in without phone - need full verification
      return !verifiedUserInfo;
    };

    return (
      <>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-2xl">
            {shouldShowReviewForm() ? (
              <form onSubmit={formik.handleSubmit}>
                <DialogTitle></DialogTitle>
                <DialogHeader className="text-lg font-bold">
                  Thanks for your feedback, we really appreciate it!
                </DialogHeader>
                <div className="flex flex-col justify-center flex-wrap p-4">
                  {invitationToken && verifiedUserInfo && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-700">
                        Reviewing as: {verifiedUserInfo.displayName} ({verifiedUserInfo.phone})
                      </p>
                    </div>
                  )}

                  <div className="my-4">
                    <div className="form-label mb-2">Please select a service:</div>
                    <CustomSelect
                      options={options || []}
                      value={formik.values.service_offering_id}
                      onChange={(obj: any) => {
                        formik.setFieldValue('service_offering_id', obj.value);
                      }}
                    />
                    {formik.errors.service_offering_id && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {formik.errors.service_offering_id}
                      </span>
                    )}
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
                    <Button
                      type="submit"
                      disabled={
                        formik.values.rating === 0 ||
                        loading ||
                        formik.values.service_offering_id === '' ||
                        !canSubmitReview()
                      }
                    >
                      {loading ? 'Submitting' : 'Submit Review'}
                    </Button>
                  </div>
                </div>
              </form>
            ) : invitationToken ? (
              <div className="p-6 text-center">
                <DialogTitle className="mb-4">Write a Review</DialogTitle>
                <DialogHeader className="text-lg font-bold mb-4">
                  Verify Your Information
                </DialogHeader>
                <p className="text-gray-600 mb-6">
                  Please verify your phone number to continue with your review.
                </p>
                <Button onClick={handleWriteReview} disabled={loading}>
                  {loading ? 'Sending Code...' : 'Verify Phone Number'}
                </Button>
              </div>
            ) : (
              <div className="p-6 text-center">
                <DialogTitle className="mb-4">Review Verification Required</DialogTitle>
                <DialogHeader className="text-lg font-bold mb-4">
                  Authentic Reviews Only
                </DialogHeader>
                <div className="max-w-md mx-auto">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">
                      To ensure the authenticity and quality of our reviews, we only allow verified
                      customers to leave feedback.
                    </p>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      You can write a review after receiving a verification email from this provider
                      for a service you've used.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">How to get verified:</h4>
                    <ol className="text-sm text-gray-600 text-left space-y-1">
                      <li>1. Use this provider's services</li>
                      <li>2. Receive a review invitation email</li>
                      <li>3. Click the review link in the email</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <PhoneVerificationModal
          open={showPhoneVerification}
          onOpenChange={() => {
            setShowPhoneVerification(false);
            setSmsSent(false);
          }}
          onVerificationSuccess={handleVerificationSuccess}
          invitationToken={invitationToken || ''}
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
          smsSent={smsSent}
        />
      </>
    );
  }
);

export { WriteAReviewModal };
