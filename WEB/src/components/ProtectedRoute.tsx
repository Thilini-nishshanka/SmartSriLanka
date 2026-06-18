// import { Navigate } from 'react-router-dom';
// import { useAuth } from '@/contexts/AuthContext';
// import type { ProtectedRouteProps } from '@/types';

// const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
//   const { user, isAdmin } = useAuth();

//   if (!user) {
//     return <Navigate to="/auth" replace />;
//   }

//   if (adminOnly && !isAdmin) {
//     return <Navigate to="/" replace />;
//   }

//   return <>{children}</>;
// };

// export default ProtectedRoute;




// import { Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from '@/contexts/AuthContext';

// interface ProtectedRouteProps {
//   children: React.ReactNode;
//   requireAdmin?: boolean;
// }

// export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
//   children, 
//   requireAdmin = false 
// }) => {
//   const { user, isAdmin } = useAuth();
//   const location = useLocation();

//   // If no user, redirect to auth page
//   if (!user) {
//     return <Navigate to="/auth" state={{ from: location }} replace />;
//   }

//   // If admin required but user is not admin, redirect to home
//   if (requireAdmin && !isAdmin) {
//     return <Navigate to="/" replace />;
//   }

//   return <>{children}</>;
// };

// // Public route that redirects authenticated users
// export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const { user, isAdmin } = useAuth();
//   const location = useLocation();

//   // If user is authenticated, redirect based on role
//   if (user) {
//     const from = (location.state as any)?.from?.pathname || (isAdmin ? '/admin' : '/');
//     return <Navigate to={from} replace />;
//   }

//   return <>{children}</>;
// };



import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false 
}) => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
