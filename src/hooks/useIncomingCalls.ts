import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from 'sonner';

interface IncomingCall {
  from: string;
  username: string;
  avatar_url: string | null;
  callType: 'voice' | 'video';
  channelName: string;
}

interface CallerInfo {
  username: string;
  avatar_url: string | null;
}

export const useIncomingCalls = () => {
  const { user } = useAuth();
  const { sendLocalNotification, permission } = usePushNotifications();
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);

  useEffect(() => {
    if (!user) return;

    // Listen for incoming voice calls
    const voiceChannel = supabase.channel(`incoming-voice-${user.id}`)
      .on('broadcast', { event: 'incoming-call' }, async ({ payload }) => {
        if (payload.to !== user.id) return;
        
        const callerInfo = await getCallerInfo(payload.from);
        
        const call: IncomingCall = {
          from: payload.from,
          username: callerInfo.username,
          avatar_url: callerInfo.avatar_url,
          callType: payload.callType || 'voice',
          channelName: payload.channelName,
        };

        setIncomingCall(call);

        // Show toast notification
        toast.info(`${callerInfo.username} sizga ${call.callType === 'video' ? 'video' : 'ovozli'} qo'ng'iroq qilmoqda`, {
          icon: call.callType === 'video' ? '📹' : '📞',
          duration: 30000,
          action: {
            label: "Javob berish",
            onClick: () => {
              // User will handle this via the incoming call UI
            }
          }
        });

        // Send push notification
        if (permission === 'granted') {
          sendLocalNotification(
            `Kiruvchi ${call.callType === 'video' ? 'video' : 'ovozli'} qo'ng'iroq`,
            {
              body: `${callerInfo.username} sizga qo'ng'iroq qilmoqda`,
              icon: callerInfo.avatar_url || '/pwa-192x192.png',
              tag: `incoming-call-${payload.from}`,
              requireInteraction: true,
              data: {
                type: 'incoming-call',
                callType: call.callType,
                from: payload.from,
              },
            }
          );
        }

        // Auto-dismiss after 30 seconds
        setTimeout(() => {
          setIncomingCall(prev => 
            prev?.from === payload.from ? null : prev
          );
        }, 30000);
      })
      .subscribe();

    // Listen for video calls
    const videoChannel = supabase.channel(`incoming-video-${user.id}`)
      .on('broadcast', { event: 'incoming-call' }, async ({ payload }) => {
        if (payload.to !== user.id) return;
        
        const callerInfo = await getCallerInfo(payload.from);
        
        const call: IncomingCall = {
          from: payload.from,
          username: callerInfo.username,
          avatar_url: callerInfo.avatar_url,
          callType: 'video',
          channelName: payload.channelName,
        };

        setIncomingCall(call);

        toast.info(`${callerInfo.username} sizga video qo'ng'iroq qilmoqda`, {
          icon: '📹',
          duration: 30000,
        });

        if (permission === 'granted') {
          sendLocalNotification(
            'Kiruvchi video qo\'ng\'iroq',
            {
              body: `${callerInfo.username} sizga video qo'ng'iroq qilmoqda`,
              icon: callerInfo.avatar_url || '/pwa-192x192.png',
              tag: `incoming-video-${payload.from}`,
              requireInteraction: true,
              data: {
                type: 'incoming-video-call',
                from: payload.from,
              },
            }
          );
        }

        setTimeout(() => {
          setIncomingCall(prev => 
            prev?.from === payload.from ? null : prev
          );
        }, 30000);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(voiceChannel);
      supabase.removeChannel(videoChannel);
    };
  }, [user, permission, sendLocalNotification]);

  const getCallerInfo = async (userId: string): Promise<CallerInfo> => {
    const { data } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('user_id', userId)
      .single();

    return {
      username: data?.username || 'Unknown',
      avatar_url: data?.avatar_url || null,
    };
  };

  const dismissCall = useCallback(() => {
    setIncomingCall(null);
  }, []);

  const sendCallNotification = useCallback(async (
    toUserId: string, 
    callType: 'voice' | 'video',
    channelName: string
  ) => {
    if (!user) return;

    const channelPrefix = callType === 'video' ? 'incoming-video' : 'incoming-voice';
    
    const channel = supabase.channel(`${channelPrefix}-${toUserId}`);
    
    await channel.subscribe();
    
    await channel.send({
      type: 'broadcast',
      event: 'incoming-call',
      payload: {
        from: user.id,
        to: toUserId,
        callType,
        channelName,
      },
    });

    // Cleanup after sending
    setTimeout(() => {
      supabase.removeChannel(channel);
    }, 1000);
  }, [user]);

  return {
    incomingCall,
    dismissCall,
    sendCallNotification,
  };
};

export default useIncomingCalls;
