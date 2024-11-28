import { useSelector } from 'react-redux'

import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { RootState } from '@/redux/store'


interface ProtectedRouteProps {
  children: React.ReactNode
  requireVerification?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireVerification = false,
}) => {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (requireVerification && !user?.isVerified) {
      router.replace('/verify-email');
      return;
    }

    setIsLoading(false);
  }, [isAuthenticated, user, requireVerification, router]);

  if (isLoading) {
    return <div>Loading...</div>; 
  }

  if (!isAuthenticated || (requireVerification && !user?.isVerified)) {
    return null; 
  }

  return <>{children}</>;
};

