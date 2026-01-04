import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Video } from "lucide-react";

interface IncomingCallBannerProps {
  username: string;
  avatarUrl: string | null;
  callType: 'voice' | 'video';
  onAccept: () => void;
  onReject: () => void;
}

export const IncomingCallBanner = ({
  username,
  avatarUrl,
  callType,
  onAccept,
  onReject,
}: IncomingCallBannerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create ringtone
    const audio = new Audio();
    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp+akYV3Z2Fgbn6MmJqXjoF0Z2FibnuIlJaShHltamx0gYuRkoyCdHFvcnaAiY2OjIV8dnRzdnyDh4qJhoJ+e3t7fICDhYaFg4F/f39/gIGCg4ODgoKBgYGBgYGBgYGBgYGBgYGBgQ==';
    audio.loop = true;
    audioRef.current = audio;

    // Play ringtone
    audio.play().catch(() => {
      // Autoplay blocked
    });

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  const handleAccept = () => {
    audioRef.current?.pause();
    onAccept();
  };

  const handleReject = () => {
    audioRef.current?.pause();
    onReject();
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md animate-in slide-in-from-top duration-300">
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl shadow-2xl p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-white/30 ring-4 ring-white/20 animate-pulse">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="bg-white/20 text-white text-lg">
              {username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-white">
            <p className="font-semibold text-lg">{username}</p>
            <p className="text-white/80 text-sm flex items-center gap-1">
              {callType === 'video' ? (
                <>
                  <Video className="h-3.5 w-3.5" />
                  Kiruvchi video qo'ng'iroq
                </>
              ) : (
                <>
                  <Phone className="h-3.5 w-3.5" />
                  Kiruvchi ovozli qo'ng'iroq
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="destructive"
              onClick={handleReject}
              className="h-12 w-12 rounded-full bg-red-500 hover:bg-red-600 shadow-lg"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              onClick={handleAccept}
              className="h-12 w-12 rounded-full bg-green-500 hover:bg-green-600 shadow-lg animate-bounce"
            >
              {callType === 'video' ? (
                <Video className="h-5 w-5" />
              ) : (
                <Phone className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallBanner;
