import { Navigate, Outlet } from 'react-router-dom';

import { ScreenLoader } from '@/components/loaders';

import { useAuthContext } from './useAuthContext';

const RequireAuth = () => {
  const { loading, auth } = useAuthContext();
  if (loading) {
    return <ScreenLoader />;
  }

  return auth ? <Outlet /> : <Navigate to="/login" replace />;
};

export { RequireAuth };
