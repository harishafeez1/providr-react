import { type MouseEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useAuthContext } from '@/auth';
import { useGoogleLogin } from '@react-oauth/google';
import { toAbsoluteUrl } from '@/utils';
import { ScreenLoader } from '@/components';

import {
  Sheet,
  SheetContent,
  SheetTitle
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff } from 'lucide-react';

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Wrong email format')
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Email is required'),
  password: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Password is required')
});

const initialValues = {
  email: '',
  password: ''
};

const DEFAULT_BG = toAbsoluteUrl('/media/images/Group.svg');

const LoginSheet = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [bgImage, setBgImage] = useState(DEFAULT_BG);
  const { login, googleLogin } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    const API_URL = import.meta.env.VITE_APP_API_URL;
    fetch(`${API_URL}/public/settings/branding`)
      .then((r) => r.json())
      .then((data) => {
        if (data.provider_login_background) {
          setBgImage(data.provider_login_background);
        }
      })
      .catch(() => {/* keep default */});
  }, []);

  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      try {
        if (!login) {
          throw new Error('JWTProvider is required for this form.');
        }
        await login(values.email, values.password);
        navigate(from, { replace: true });
      } catch {
        setStatus('The login details are incorrect');
        setSubmitting(false);
      }
      setLoading(false);
    }
  });

  const togglePassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setShowPassword(!showPassword);
  };

  const gooleLogin = useGoogleLogin({
    onSuccess: async (code) => {
      try {
        setLoading(true);
        await googleLogin(code);
        navigate(from, { replace: true });
        setLoading(false);
      } catch {
        setLoading(false);
      }
    },
    flow: 'auth-code',
    onError: () => {
      console.log('Login Failed');
    }
  });

  if (loading) {
    return <ScreenLoader />;
  }

  return (
    <Sheet defaultOpen open onOpenChange={(open) => { if (!open) navigate('/'); }}>
      <SheetContent
        side="right"
        close={false}
        className="w-full sm:w-[50vw] sm:max-w-[50vw] p-0 flex flex-row"
      >
        <SheetTitle className="sr-only">Login</SheetTitle>

        {/* Left column - hero image */}
        <div className="hidden md:block md:w-1/2 relative">
          <img
            src={bgImage}
            alt="Hero"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Right column - login form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 py-10 overflow-y-auto">
          <div className="w-full max-w-[360px] mx-auto flex flex-col gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-2">
              <Link to="/">
                <img
                  src={toAbsoluteUrl('/media/app/logo2.png')}
                  className="h-[32px] max-w-none"
                  alt="Providr"
                />
              </Link>
            </div>

            {/* Heading */}
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">Login to your account</h1>
              <p className="text-sm text-muted-foreground">
                Enter your email below to login to your account
              </p>
            </div>

            <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col gap-4">
              {formik.status && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {formik.status}
                </div>
              )}

              {/* Email */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="off"
                  {...formik.getFieldProps('email')}
                />
                {formik.touched.email && formik.errors.email && (
                  <span className="text-destructive text-xs">{formik.errors.email}</span>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/auth/reset-password"
                    className="text-sm underline-offset-4 hover:underline text-muted-foreground"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    autoComplete="off"
                    {...formik.getFieldProps('password')}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={togglePassword}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <span className="text-destructive text-xs">{formik.errors.password}</span>
                )}
              </div>

              {/* Login button */}
              <Button type="submit" className="w-full" disabled={loading || formik.isSubmitting}>
                {loading ? 'Please wait...' : 'Login'}
              </Button>
            </form>

            {/* Separator */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Google login */}
            <Button
              variant="outline"
              className="w-full"
              type="button"
              onClick={() => gooleLogin()}
            >
              <img
                src={toAbsoluteUrl('/media/brand-logos/google.svg')}
                className="h-4 w-4 mr-2"
                alt="Google"
              />
              Login with Google
            </Button>

            {/* Sign up link */}
            <div className="text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link to="/auth/signup" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export { LoginSheet };
