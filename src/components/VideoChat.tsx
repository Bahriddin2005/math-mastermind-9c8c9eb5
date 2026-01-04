import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Video, VideoOff, Mic, MicOff, PhoneOff, Crown, Circle, Loader2, 
  Camera, CameraOff, Maximize2, Minimize2
} from "lucide-react";

interface VideoChatProps {
  friend: {
    user_id: string;
    username: string;
    avatar_url: string | null;
    vip_expires_at: string | null;
  };
  isOnline: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'call-request' | 'call-accept' | 'call-reject' | 'call-end';
  from: string;
  to: string;
  callType: 'video';
  payload?: any;
}

export const VideoChat = ({ friend, isOnline, open, onOpenChange }: VideoChatProps) => {
  const { user } = useAuth();
  const [callState, setCallState] = useState<'idle' | 'calling' | 'receiving' | 'connected'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isVip = friend.vip_expires_at && new Date(friend.vip_expires_at) > new Date();

  useEffect(() => {
    if (!user || !open) return;

    const channelName = `video-${[user.id, friend.user_id].sort().join('-')}`;
    
    const channel = supabase.channel(channelName)
      .on('broadcast', { event: 'signal' }, async ({ payload }) => {
        const message = payload as SignalingMessage;
        
        if (message.to !== user.id || message.callType !== 'video') return;

        switch (message.type) {
          case 'call-request':
            setCallState('receiving');
            break;
          case 'call-accept':
            await handleCallAccepted();
            break;
          case 'call-reject':
            handleCallRejected();
            break;
          case 'call-end':
            handleCallEnded();
            break;
          case 'offer':
            await handleOffer(message.payload);
            break;
          case 'answer':
            await handleAnswer(message.payload);
            break;
          case 'ice-candidate':
            await handleIceCandidate(message.payload);
            break;
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      cleanupCall();
    };
  }, [user, friend.user_id, open]);

  useEffect(() => {
    if (callState === 'connected') {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
      setCallDuration(0);
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [callState]);

  const sendSignal = async (message: SignalingMessage) => {
    if (!channelRef.current) return;
    
    await channelRef.current.send({
      type: 'broadcast',
      event: 'signal',
      payload: message,
    });
  };

  const createPeerConnection = () => {
    const config: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    const pc = new RTCPeerConnection(config);

    pc.onicecandidate = (event) => {
      if (event.candidate && user) {
        sendSignal({
          type: 'ice-candidate',
          from: user.id,
          to: friend.user_id,
          callType: 'video',
          payload: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setCallState('connected');
        setIsLoading(false);
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        handleCallEnded();
      }
    };

    return pc;
  };

  const startCall = async () => {
    if (!user || !isOnline) {
      toast.error("Do'st hozir online emas");
      return;
    }

    setIsLoading(true);
    setCallState('calling');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: { width: 640, height: 480 } 
      });
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      await sendSignal({
        type: 'call-request',
        from: user.id,
        to: friend.user_id,
        callType: 'video',
      });

      setTimeout(() => {
        if (callState === 'calling') {
          toast.error("Javob berilmadi");
          cleanupCall();
        }
      }, 30000);
    } catch (error) {
      console.error('Error starting call:', error);
      toast.error("Kamera yoki mikrofonga ruxsat berilmadi");
      cleanupCall();
    }
  };

  const handleCallAccepted = async () => {
    if (!user || !localStreamRef.current) return;

    try {
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await sendSignal({
        type: 'offer',
        from: user.id,
        to: friend.user_id,
        callType: 'video',
        payload: offer,
      });
    } catch (error) {
      console.error('Error creating offer:', error);
      handleCallEnded();
    }
  };

  const acceptCall = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: { width: 640, height: 480 } 
      });
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      await sendSignal({
        type: 'call-accept',
        from: user.id,
        to: friend.user_id,
        callType: 'video',
      });
    } catch (error) {
      console.error('Error accepting call:', error);
      toast.error("Kamera yoki mikrofonga ruxsat berilmadi");
      rejectCall();
    }
  };

  const rejectCall = async () => {
    if (!user) return;

    await sendSignal({
      type: 'call-reject',
      from: user.id,
      to: friend.user_id,
      callType: 'video',
    });

    cleanupCall();
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    if (!user || !localStreamRef.current) return;

    try {
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await sendSignal({
        type: 'answer',
        from: user.id,
        to: friend.user_id,
        callType: 'video',
        payload: answer,
      });
    } catch (error) {
      console.error('Error handling offer:', error);
      handleCallEnded();
    }
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current) return;

    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (!peerConnectionRef.current) return;

    try {
      await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  };

  const handleCallRejected = () => {
    toast.error("Qo'ng'iroq rad etildi");
    cleanupCall();
  };

  const handleCallEnded = () => {
    cleanupCall();
  };

  const endCall = async () => {
    if (!user) return;

    await sendSignal({
      type: 'call-end',
      from: user.id,
      to: friend.user_id,
      callType: 'video',
    });

    cleanupCall();
  };

  const cleanupCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setCallState('idle');
    setIsLoading(false);
    setIsMuted(false);
    setIsVideoOff(false);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = isVideoOff;
        setIsVideoOff(!isVideoOff);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    if (callState !== 'idle') {
      endCall();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]" ref={containerRef}>
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Video qo'ng'iroq
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Video container */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            {/* Remote video (main) */}
            {callState === 'connected' ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/20">
                <Avatar className={`h-24 w-24 border-4 ${
                  callState === 'calling' || callState === 'receiving' 
                    ? 'border-primary animate-pulse' : 'border-background'
                }`}>
                  <AvatarImage src={friend.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl bg-primary/10">
                    {friend.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="mt-4 font-semibold text-lg flex items-center gap-2">
                  {friend.username}
                  {isVip && <Crown className="h-4 w-4 text-amber-500" />}
                </h3>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                  <Circle className={`h-2 w-2 ${isOnline ? 'fill-green-500 text-green-500' : 'fill-muted-foreground/50'}`} />
                  {isOnline ? "Online" : "Offline"}
                </div>
                {callState === 'calling' && (
                  <p className="mt-4 text-primary animate-pulse">Chaqirilmoqda...</p>
                )}
                {callState === 'receiving' && (
                  <p className="mt-4 text-green-500 animate-pulse">Kiruvchi video qo'ng'iroq...</p>
                )}
              </div>
            )}

            {/* Local video (small overlay) */}
            {(callState === 'calling' || callState === 'connected') && (
              <div className="absolute bottom-4 right-4 w-32 h-24 bg-black rounded-lg overflow-hidden border-2 border-background shadow-lg">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
                />
                {isVideoOff && (
                  <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                    <CameraOff className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            )}

            {/* Call duration */}
            {callState === 'connected' && (
              <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full">
                <p className="text-white font-mono text-sm">{formatDuration(callDuration)}</p>
              </div>
            )}

            {/* Fullscreen button */}
            {callState === 'connected' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {callState === 'idle' && (
              <Button
                size="lg"
                onClick={startCall}
                disabled={!isOnline || isLoading}
                className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600"
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Video className="h-6 w-6" />
                )}
              </Button>
            )}

            {callState === 'calling' && (
              <Button
                size="lg"
                variant="destructive"
                onClick={endCall}
                className="h-14 w-14 rounded-full"
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            )}

            {callState === 'receiving' && (
              <>
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={rejectCall}
                  className="h-12 w-12 rounded-full"
                >
                  <PhoneOff className="h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  onClick={acceptCall}
                  disabled={isLoading}
                  className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600"
                >
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Video className="h-6 w-6" />
                  )}
                </Button>
              </>
            )}

            {callState === 'connected' && (
              <>
                <Button
                  size="lg"
                  variant={isMuted ? "destructive" : "secondary"}
                  onClick={toggleMute}
                  className="h-12 w-12 rounded-full"
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                <Button
                  size="lg"
                  variant={isVideoOff ? "destructive" : "secondary"}
                  onClick={toggleVideo}
                  className="h-12 w-12 rounded-full"
                >
                  {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
                </Button>
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={endCall}
                  className="h-14 w-14 rounded-full"
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoChat;
