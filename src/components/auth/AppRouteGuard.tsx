import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from 'miaoda-auth-react';

const DEFAULT_WHITELIST = ['/login', '/auth/wechat'];

const matchesPattern = (path: string, pattern: string) => {
  if (pattern.endsWith('*')) {
    const prefix = pattern.slice(0, -1);
    return path.startsWith(prefix);
  }
  return path === pattern;
};

interface AppRouteGuardProps {
  children: ReactNode;
  whiteList?: string[];
}

export function AppRouteGuard({ children, whiteList = [] }: AppRouteGuardProps) {
  const location = useLocation();
  const { isAuthenticated, isLoading, loginPath = '/login', devMode } = useAuth();

  const isPublic = [...DEFAULT_WHITELIST, ...whiteList].some((pattern) =>
    matchesPattern(location.pathname, pattern),
  );

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated && !isPublic && !devMode) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
