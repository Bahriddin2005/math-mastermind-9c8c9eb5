import { useState, useEffect, ReactNode } from 'react';
import { useOfflineCache } from '@/hooks/useOfflineCache';
import { OfflineBanner } from './OfflineBanner';

interface OfflineWrapperProps {
  children: ReactNode;
}

export const OfflineWrapper = ({ children }: OfflineWrapperProps) => {
  const { isOnline } = useOfflineCache({ key: 'app_state' });
  const [showBanner, setShowBanner] = useState(!isOnline);

  useEffect(() => {
    setShowBanner(!isOnline);
  }, [isOnline]);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <>
      {showBanner && <OfflineBanner onRetry={handleRetry} />}
      <div className={showBanner ? 'pt-10' : ''}>
        {children}
      </div>
    </>
  );
};
