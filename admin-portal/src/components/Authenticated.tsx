import { useIsAuthenticated } from '@refinedev/core';
import { Navigate } from 'react-router-dom';

export function Authenticated({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useIsAuthenticated();

  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!data?.authenticated) return <Navigate to="/login" />;

  return <>{children}</>;
}
