import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OfflineBannerProps {
  onRetry?: () => void;
}

export const OfflineBanner = ({ onRetry }: OfflineBannerProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-yellow-500/95 text-yellow-950 px-4 py-2 safe-top">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">Internet aloqasi yo'q</span>
        </div>
        {onRetry && (
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 px-2 text-yellow-950 hover:bg-yellow-600/50"
            onClick={onRetry}
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Qayta urinish
          </Button>
        )}
      </div>
    </div>
  );
};
