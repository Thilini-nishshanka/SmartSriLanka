import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBasicAuth } from '@/contexts/BasicAuthContext';

interface BasicProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function BasicProtectedRoute({ children, adminOnly = false }: BasicProtectedRouteProps) {
  const { user, isAdmin } = useBasicAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/basic-login');
      return;
    }

    if (adminOnly && !isAdmin) {
      navigate('/dashboard');
      return;
    }
  }, [user, isAdmin, adminOnly, navigate]);

  if (!user) {
    return null;
  }

  if (adminOnly && !isAdmin) {
    return null;
  }

  return <>{children}</>;
}