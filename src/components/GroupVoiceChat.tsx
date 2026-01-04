import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Crown, Circle, 
  Loader2, Users, UserPlus, X
} from "lucide-react";

interface Participant {
  user_id: string;
  username: string;
  avatar_url: string | null;
  vip_expires_at: string | null;
  isSpeaking?: boolean;
  isMuted?: boolean;
}

interface GroupVoiceChatProps {
  roomId: string;
  participants: Participant[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInviteFriend?: () => void;
}

interface SignalingMessage {
  type: 'join' | 'leave' | 'offer' | 'answer' | 'ice-candidate' | 'mute-status';
  from: string;
  to?: string;
  roomId: string;
  payload?: any;
}

export const GroupVoiceChat = ({ 
  roomId, 
  participants: initialParticipants, 
  open, 
  onOpenChange,
  onInviteFriend 
}: GroupVoiceChatProps) => {
  const { user } = useAuth();
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudiosRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user || !open) return;

    const channelName = `group-voice-${roomId}`;
    
    const channel = supabase.channel(channelName)
      .on('broadcast', { event: 'signal' }, async ({ payload }) => {
        const message = payload as SignalingMessage;
        
        if (message.roomId !== roomId) return;

        switch (message.type) {
          case 'join':
            await handleUserJoined(message.from, message.payload);
            break;
          case 'leave':
            handleUserLeft(message.from);
            break;
          case 'offer':
            if (message.to === user.id) {
              await handleOffer(message.from, message.payload);
            }
            break;
          case 'answer':
            if (message.to === user.id) {
              await handleAnswer(message.from, message.payload);
            }
            break;
          case 'ice-candidate':
            if (message.to === user.id) {
              await handleIceCandidate(message.from, message.payload);
            }
            break;
          case 'mute-status':
            handleMuteStatus(message.from, message.payload);
            break;
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      leaveCall();
      supabase.removeChannel(channel);
    };
  }, [user, roomId, open]);

  useEffect(() => {
    if (isConnected) {
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
  }, [isConnected]);

  const sendSignal = async (message: SignalingMessage) => {
    if (!channelRef.current) return;
    
    await channelRef.current.send({
      type: 'broadcast',
      event: 'signal',
      payload: message,
    });
  };

  const createPeerConnection = (peerId: string) => {
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
          to: peerId,
          roomId,
          payload: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      let audio = remoteAudiosRef.current.get(peerId);
      if (!audio) {
        audio = new Audio();
        audio.autoplay = true;
        remoteAudiosRef.current.set(peerId, audio);
      }
      audio.srcObject = event.streams[0];
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        handleUserLeft(peerId);
      }
    };

    return pc;
  };

  const joinCall = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      // Get current user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url, vip_expires_at')
        .eq('user_id', user.id)
        .single();

      // Announce join
      await sendSignal({
        type: 'join',
        from: user.id,
        roomId,
        payload: {
          username: profile?.username || 'User',
          avatar_url: profile?.avatar_url,
          vip_expires_at: profile?.vip_expires_at,
        },
      });

      // Connect to existing participants
      for (const participant of participants) {
        if (participant.user_id !== user.id) {
          await initiateConnection(participant.user_id);
        }
      }

      setIsConnected(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error joining call:', error);
      toast.error("Mikrofonga ruxsat berilmadi");
      setIsLoading(false);
    }
  };

  const initiateConnection = async (peerId: string) => {
    if (!user || !localStreamRef.current) return;

    const pc = createPeerConnection(peerId);
    peerConnectionsRef.current.set(peerId, pc);

    localStreamRef.current.getTracks().forEach(track => {
      pc.addTrack(track, localStreamRef.current!);
    });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    await sendSignal({
      type: 'offer',
      from: user.id,
      to: peerId,
      roomId,
      payload: offer,
    });
  };

  const handleUserJoined = async (userId: string, userInfo: any) => {
    if (userId === user?.id) return;

    // Add to participants
    setParticipants(prev => {
      if (prev.some(p => p.user_id === userId)) return prev;
      return [...prev, {
        user_id: userId,
        username: userInfo.username,
        avatar_url: userInfo.avatar_url,
        vip_expires_at: userInfo.vip_expires_at,
      }];
    });

    toast.success(`${userInfo.username} qo'shildi`);
  };

  const handleUserLeft = (userId: string) => {
    // Close peer connection
    const pc = peerConnectionsRef.current.get(userId);
    if (pc) {
      pc.close();
      peerConnectionsRef.current.delete(userId);
    }

    // Remove audio element
    const audio = remoteAudiosRef.current.get(userId);
    if (audio) {
      audio.srcObject = null;
      remoteAudiosRef.current.delete(userId);
    }

    // Remove from participants
    setParticipants(prev => {
      const leaving = prev.find(p => p.user_id === userId);
      if (leaving) {
        toast.info(`${leaving.username} chiqdi`);
      }
      return prev.filter(p => p.user_id !== userId);
    });
  };

  const handleOffer = async (fromId: string, offer: RTCSessionDescriptionInit) => {
    if (!user || !localStreamRef.current) return;

    const pc = createPeerConnection(fromId);
    peerConnectionsRef.current.set(fromId, pc);

    localStreamRef.current.getTracks().forEach(track => {
      pc.addTrack(track, localStreamRef.current!);
    });

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    await sendSignal({
      type: 'answer',
      from: user.id,
      to: fromId,
      roomId,
      payload: answer,
    });
  };

  const handleAnswer = async (fromId: string, answer: RTCSessionDescriptionInit) => {
    const pc = peerConnectionsRef.current.get(fromId);
    if (!pc) return;

    await pc.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleIceCandidate = async (fromId: string, candidate: RTCIceCandidateInit) => {
    const pc = peerConnectionsRef.current.get(fromId);
    if (!pc) return;

    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  };

  const handleMuteStatus = (userId: string, isMuted: boolean) => {
    setParticipants(prev => 
      prev.map(p => p.user_id === userId ? { ...p, isMuted } : p)
    );
  };

  const leaveCall = async () => {
    if (!user) return;

    await sendSignal({
      type: 'leave',
      from: user.id,
      roomId,
    });

    // Cleanup
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();

    remoteAudiosRef.current.forEach(audio => {
      audio.srcObject = null;
    });
    remoteAudiosRef.current.clear();

    setIsConnected(false);
    setIsMuted(false);
  };

  const toggleMute = () => {
    if (localStreamRef.current && user) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
        
        sendSignal({
          type: 'mute-status',
          from: user.id,
          roomId,
          payload: !isMuted,
        });
      }
    }
  };

  const toggleSpeaker = () => {
    remoteAudiosRef.current.forEach(audio => {
      audio.muted = isSpeakerOn;
    });
    setIsSpeakerOn(!isSpeakerOn);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    if (isConnected) {
      leaveCall();
    }
    onOpenChange(false);
  };

  const isVip = (vipExpires: string | null) => {
    return vipExpires && new Date(vipExpires) > new Date();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Guruh suhbati
            </span>
            {isConnected && (
              <Badge variant="secondary" className="font-mono">
                {formatDuration(callDuration)}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Participants */}
          <ScrollArea className="h-48">
            <div className="grid grid-cols-3 gap-3">
              {participants.map((participant) => (
                <div 
                  key={participant.user_id}
                  className={`flex flex-col items-center p-3 rounded-lg ${
                    participant.user_id === user?.id ? 'bg-primary/10' : 'bg-secondary/50'
                  }`}
                >
                  <div className="relative">
                    <Avatar className={`h-12 w-12 border-2 ${
                      participant.isMuted ? 'border-red-500' : 'border-green-500'
                    }`}>
                      <AvatarImage src={participant.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10">
                        {participant.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {participant.isMuted && (
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
                        <MicOff className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="mt-2 text-xs font-medium truncate w-full text-center flex items-center justify-center gap-1">
                    {participant.username}
                    {isVip(participant.vip_expires_at) && (
                      <Crown className="h-3 w-3 text-amber-500" />
                    )}
                  </span>
                  {participant.user_id === user?.id && (
                    <span className="text-[10px] text-muted-foreground">(siz)</span>
                  )}
                </div>
              ))}

              {/* Add participant button */}
              {isConnected && onInviteFriend && (
                <button
                  onClick={onInviteFriend}
                  className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors"
                >
                  <UserPlus className="h-8 w-8 text-muted-foreground" />
                  <span className="mt-2 text-xs text-muted-foreground">Qo'shish</span>
                </button>
              )}
            </div>
          </ScrollArea>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t">
            {!isConnected ? (
              <Button
                size="lg"
                onClick={joinCall}
                disabled={isLoading}
                className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600"
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Phone className="h-6 w-6" />
                )}
              </Button>
            ) : (
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
                  variant="destructive"
                  onClick={leaveCall}
                  className="h-14 w-14 rounded-full"
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
                <Button
                  size="lg"
                  variant={isSpeakerOn ? "secondary" : "outline"}
                  onClick={toggleSpeaker}
                  className="h-12 w-12 rounded-full"
                >
                  {isSpeakerOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupVoiceChat;
