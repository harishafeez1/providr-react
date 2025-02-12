import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { ScreenLoader } from '@/components/loaders';

import { useAuthContext } from './useAuthContext';

const RequireAuth = () => {
  const { loading, auth } = useAuthContext();
  const location = useLocation();
  if (loading) {
    return <ScreenLoader />;
  }

  return auth ? <Outlet /> : <Navigate to="/auth/classic/login" />;
};

export { RequireAuth };
