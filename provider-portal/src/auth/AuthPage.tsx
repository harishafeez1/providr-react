import { Navigate, Route, Routes } from 'react-router';
import {
  ResetPassword,
  ResetPasswordChange,
  ResetPasswordChanged,
  ResetPasswordCheckEmail,
  ResetPasswordEnterEmail,
  Signup,
  TwoFactorAuth
} from './pages/jwt';
import { AuthBrandedLayout } from '@/layouts/auth-branded';
import { CheckEmail } from '@/auth/pages/jwt';
import { LoginSheet } from '@/components/auth/LoginSheet';

const AuthPage = () => (
  <Routes>
    <Route index element={<LoginSheet />} />
    <Route path="/login" element={<LoginSheet />} />
    <Route element={<AuthBrandedLayout />}>
      <Route path="/signup" element={<Signup />} />
      <Route path="/2fa" element={<TwoFactorAuth />} />
      <Route path="/check-email" element={<CheckEmail />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/reset-password/enter-email" element={<ResetPasswordEnterEmail />} />
      <Route path="/reset-password/check-email" element={<ResetPasswordCheckEmail />} />
      <Route path="/reset-password/change" element={<ResetPasswordChange />} />
      <Route path="/reset-password/changed" element={<ResetPasswordChanged />} />
      <Route path="*" element={<Navigate to="/error/404" />} />
    </Route>
  </Routes>
);

export { AuthPage };
