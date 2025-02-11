import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { ScreenLoader } from '@/components/loaders';

import { useAuthContext } from './useAuthContext';

const RequireAuth = () => {
  const { loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return <ScreenLoader />;
  }
  const auth = true;
  return <Outlet />;
};

export { RequireAuth };
