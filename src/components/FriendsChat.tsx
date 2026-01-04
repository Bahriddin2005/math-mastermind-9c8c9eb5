import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  MessageCircle, Send, Loader2, Crown, Circle, ArrowLeft
} from "lucide-react";
import { usePresence } from "@/hooks/usePresence";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface FriendProfile {
  user_id: string;
  username: string;
  avatar_url: string | null;
  vip_expires_at: string | null;
}

interface FriendsChatProps {
  friend: FriendProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FriendsChat = ({ friend, open, onOpenChange }: FriendsChatProps) => {
  const { user } = useAuth();
  const { isUserOnline } = usePresence('friends-presence');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isOnline = isUserOnline(friend.user_id);
  const isVip = friend.vip_expires_at && new Date(friend.vip_expires_at) > new Date();

  useEffect(() => {
    if (open && user) {
      loadMessages();
      markAsRead();

      // Subscribe to new messages
      const channel = supabase
        .channel(`chat-${user.id}-${friend.user_id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'friend_messages',
            filter: `sender_id=eq.${friend.user_id}`,
          },
          (payload) => {
            const newMsg = payload.new as Message;
            if (newMsg.receiver_id === user.id) {
              setMessages(prev => [...prev, newMsg]);
              markAsRead();
              scrollToBottom();
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [open, user, friend.user_id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data } = await supabase
        .from('friend_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friend.user_id}),and(sender_id.eq.${friend.user_id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })
        .limit(100);

      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    if (!user) return;

    await supabase
      .from('friend_messages')
      .update({ is_read: true })
      .eq('sender_id', friend.user_id)
      .eq('receiver_id', user.id)
      .eq('is_read', false);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async () => {
    if (!user || !newMessage.trim()) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage("");

    try {
      const { data, error } = await supabase
        .from('friend_messages')
        .insert({
          sender_id: user.id,
          receiver_id: friend.user_id,
          content: messageContent,
        })
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, data]);
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Xabar yuborishda xatolik");
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return format(date, 'HH:mm');
    }
    return format(date, 'dd.MM HH:mm');
  };

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    msgs.forEach(msg => {
      const date = new Date(msg.created_at).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Bugun";
    if (date.toDateString() === yesterday.toDateString()) return "Kecha";
    return format(date, 'dd MMMM yyyy');
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md h-[80vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="p-4 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10 border-2 border-background">
                <AvatarImage src={friend.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10">
                  {friend.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div 
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${
                  isOnline ? 'bg-green-500' : 'bg-muted-foreground/50'
                }`}
              />
            </div>
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2">
                {friend.username}
                {isVip && (
                  <Crown className="h-4 w-4 text-amber-500" />
                )}
              </DialogTitle>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Circle className={`h-2 w-2 ${isOnline ? 'fill-green-500 text-green-500' : 'fill-muted-foreground/50 text-muted-foreground/50'}`} />
                {isOnline ? "Online" : "Offline"}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>Hali xabarlar yo'q</p>
              <p className="text-sm">Birinchi xabarni yuboring!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date}>
                  <div className="flex justify-center mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {formatDateHeader(date)}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {msgs.map((message) => {
                      const isMe = message.sender_id === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                              isMe
                                ? 'bg-primary text-primary-foreground rounded-br-md'
                                : 'bg-secondary rounded-bl-md'
                            }`}
                          >
                            <p className="text-sm break-words">{message.content}</p>
                            <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                              {formatMessageTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t flex-shrink-0">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Xabar yozing..."
              disabled={sending}
              className="flex-1"
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!newMessage.trim() || sending}
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FriendsChat;
