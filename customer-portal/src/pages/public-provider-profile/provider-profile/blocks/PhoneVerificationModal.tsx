import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import React, { useState, useRef, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { sendSmsVerification, verifySmsCode } from '@/services/api/reviews';

interface PhoneVerificationModalProps {
  open: boolean;
  onOpenChange: () => void;
  onVerificationSuccess: (userInfo: { phone: string; email: string; displayName: string }) => void;
  invitationToken: string;
  isLoggedIn: boolean;
  currentUser?: any;
  smsSent?: boolean; // Indicates if SMS was already sent
}

interface UserInfoForm {
  phone: string;
  email: string;
  displayName: string;
}

const PhoneVerificationModal = ({
  open,
  onOpenChange,
  onVerificationSuccess,
  invitationToken,
  isLoggedIn,
  currentUser,
  smsSent = false
}: PhoneVerificationModalProps) => {
  // Start with SMS verification if user is logged in with phone
  const [step, setStep] = useState<'user-info' | 'sms-verification'>(
    isLoggedIn && currentUser?.phone ? 'sms-verification' : 'user-info'
  );
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [countdown, setCountdown] = useState(smsSent ? 60 : 0);
  const smsInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const userInfoInitialValues: UserInfoForm = {
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    displayName: currentUser?.display_name || currentUser?.name || ''
  };

  const UserInfoSchema = Yup.object().shape({
    phone: currentUser?.phone
      ? Yup.string()
      : Yup.string()
          .required('Phone number is required')
          .matches(/^\d{10}$/, 'Phone number must be exactly 10 digits')
          .test('starts-with-zero', 'Phone number should start with 0', value => value ? value.startsWith('0') : false),
    email:
      isLoggedIn && currentUser?.email
        ? Yup.string()
        : Yup.string().email('Invalid email').required('Email is required'),
    displayName:
      isLoggedIn && currentUser?.name
        ? Yup.string()
        : Yup.string().required('Display name is required')
  });

  const userInfoFormik = useFormik({
    initialValues: userInfoInitialValues,
    validationSchema: UserInfoSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const phoneToUse = currentUser?.phone || values.phone;
        await sendSmsVerification(invitationToken, phoneToUse);
        setStep('sms-verification');
        setCountdown(60);
      } catch (error) {
        console.error('Error sending SMS:', error);
      } finally {
        setLoading(false);
      }
    }
  });

  const handleSmsCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCode = smsCode.split('');
    newCode[index] = value;
    setSmsCode(newCode.join(''));

    if (value && index < 5) {
      smsInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !smsCode[index] && index > 0) {
      smsInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async () => {
    if (smsCode.length !== 6) return;

    setLoading(true);
    try {
      await verifySmsCode(invitationToken, smsCode);
      onVerificationSuccess({
        phone: currentUser?.phone || userInfoFormik.values.phone,
        email: currentUser?.email || userInfoFormik.values.email,
        displayName:
          currentUser?.name || currentUser?.display_name || userInfoFormik.values.displayName
      });
      onOpenChange();
    } catch (error) {
      console.error('Error verifying SMS code:', error);
      setSmsCode('');
      smsInputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setResending(true);
    try {
      const phoneToUse = currentUser?.phone || userInfoFormik.values.phone;
      await sendSmsVerification(invitationToken, phoneToUse);
      setCountdown(60);
      setSmsCode('');
      smsInputRefs.current[0]?.focus();
    } catch (error) {
      console.error('Error resending SMS:', error);
    } finally {
      setResending(false);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (step === 'sms-verification' && smsInputRefs.current[0]) {
      smsInputRefs.current[0].focus();
    }
  }, [step]);


  const shouldShowField = (field: 'email' | 'displayName' | 'phone') => {
    if (!isLoggedIn) return true;
    if (field === 'phone' && !currentUser?.phone) return true;
    if (field === 'email' && !currentUser?.email) return true;
    if (field === 'displayName' && !currentUser?.name && !currentUser?.display_name) return true;
    return false;
  };

  const shouldShowUserInfoStep = () => {
    // If user is logged in with phone, skip user info and go straight to SMS
    if (isLoggedIn && currentUser?.phone) {
      return false;
    }
    // Show user info step if user needs to provide missing information
    return shouldShowField('phone') || shouldShowField('email') || shouldShowField('displayName');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'user-info' ? 'Verify Your Information' : 'Enter Verification Code'}
          </DialogTitle>
        </DialogHeader>

        {step === 'user-info' && shouldShowUserInfoStep() ? (
          <form onSubmit={userInfoFormik.handleSubmit} className="space-y-4 p-4">
            {shouldShowField('phone') && (
              <div>
                <label className="form-label mb-2">Phone Number *</label>
                <Input
                  type="tel"
                  placeholder="0123456789"
                  value={userInfoFormik.values.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    userInfoFormik.setFieldValue('phone', value);
                  }}
                  onBlur={userInfoFormik.handleBlur}
                  name="phone"
                  maxLength={10}
                />
                {userInfoFormik.touched.phone && userInfoFormik.errors.phone && (
                  <span className="text-red-500 text-xs mt-1">{userInfoFormik.errors.phone}</span>
                )}
              </div>
            )}

            {shouldShowField('email') && (
              <div>
                <label className="form-label mb-2">Email *</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={userInfoFormik.values.email}
                  onChange={userInfoFormik.handleChange}
                  onBlur={userInfoFormik.handleBlur}
                  name="email"
                />
                {userInfoFormik.touched.email && userInfoFormik.errors.email && (
                  <span className="text-red-500 text-xs mt-1">{userInfoFormik.errors.email}</span>
                )}
              </div>
            )}

            {shouldShowField('displayName') && (
              <div>
                <label className="form-label mb-2">Display Name *</label>
                <Input
                  type="text"
                  placeholder="Your Name"
                  value={userInfoFormik.values.displayName}
                  onChange={userInfoFormik.handleChange}
                  onBlur={userInfoFormik.handleBlur}
                  name="displayName"
                />
                {userInfoFormik.touched.displayName && userInfoFormik.errors.displayName && (
                  <span className="text-red-500 text-xs mt-1">
                    {userInfoFormik.errors.displayName}
                  </span>
                )}
              </div>
            )}

            <div className="flex justify-center mt-6">
              <Button type="submit" disabled={loading}>
                {loading ? 'Sending Code...' : 'Send Verification Code'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                {isLoggedIn && currentUser?.phone 
                  ? `SMS verification code sent to your saved number ${currentUser.phone}`
                  : `Enter the 6-digit code sent to ${currentUser?.phone || userInfoFormik.values.phone}`
                }
              </p>

              <div className="flex justify-center space-x-2 mb-4">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <Input
                    key={index}
                    ref={(ref) => (smsInputRefs.current[index] = ref)}
                    type="text"
                    maxLength={1}
                    className="w-12 h-12 text-center text-lg"
                    value={smsCode[index] || ''}
                    onChange={(e) => handleSmsCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                  />
                ))}
              </div>

              <Button
                onClick={handleVerifyCode}
                disabled={loading || smsCode.length !== 6}
                className="w-full mb-4"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </Button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={countdown > 0 || resending}
                className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
              >
                {resending ? 'Sending Code...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export { PhoneVerificationModal };
