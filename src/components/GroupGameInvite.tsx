import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { 
  Users, Crown, Gamepad2, Loader2, Send, Circle
} from "lucide-react";
import { usePresence } from "@/hooks/usePresence";

interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  friend_profile?: {
    username: string;
    avatar_url: string | null;
    vip_expires_at: string | null;
  };
  user_profile?: {
    username: string;
    avatar_url: string | null;
    vip_expires_at: string | null;
  };
}

interface GroupGameInviteProps {
  friends: Friend[];
  trigger?: React.ReactNode;
}

export const GroupGameInvite = ({ friends, trigger }: GroupGameInviteProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isUserOnline } = usePresence('friends-presence');
  const [open, setOpen] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const isVip = (vipExpires: string | null | undefined) => {
    return vipExpires && new Date(vipExpires) > new Date();
  };

  const toggleFriend = (friendId: string) => {
    setSelectedFriends(prev => 
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSendInvites = async () => {
    if (!user || selectedFriends.length === 0) return;

    setSending(true);

    try {
      // Generate a single room code for the group
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      // Create invitations for all selected friends
      const invitations = selectedFriends.map(friendId => ({
        sender_id: user.id,
        receiver_id: friendId,
        room_code: roomCode,
        game_type: 'mental-arithmetic',
      }));

      const { error } = await supabase
        .from('game_invitations')
        .insert(invitations);

      if (error) throw error;

      toast.success(`${selectedFriends.length} ta do'stga taklif yuborildi!`, {
        icon: '🎮',
      });

      setOpen(false);
      setSelectedFriends([]);

      // Navigate to multiplayer with room code
      navigate(`/mental-arithmetic?mode=multiplayer&room=${roomCode}&host=true`);
    } catch (error) {
      console.error('Error sending group invites:', error);
      toast.error("Taklifnomalarni yuborishda xatolik");
    } finally {
      setSending(false);
    }
  };

  // Get online friends only
  const onlineFriends = friends.filter(friend => {
    const friendUserId = friend.friend_profile ? friend.friend_id : friend.user_id;
    return isUserOnline(friendUserId);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Users className="h-4 w-4" />
            Guruh o'yini
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Gamepad2 className="h-6 w-6 text-primary" />
            Guruh O'yiniga Taklif
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            O'yinga taklif qilmoqchi bo'lgan do'stlarni tanlang (faqat online do'stlar)
          </p>

          {onlineFriends.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>Hozirda online do'stlar yo'q</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {onlineFriends.map((friend) => {
                const profile = friend.friend_profile || friend.user_profile;
                const friendUserId = friend.friend_profile ? friend.friend_id : friend.user_id;
                const isSelected = selectedFriends.includes(friendUserId);

                return (
                  <div 
                    key={friend.id} 
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-primary/10 border border-primary/30' 
                        : 'bg-secondary/30 hover:bg-secondary/50'
                    }`}
                    onClick={() => toggleFriend(friendUserId)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleFriend(friendUserId)}
                      />
                      <div className="relative">
                        <Avatar className="h-10 w-10 border-2 border-background">
                          <AvatarImage src={profile?.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10">
                            {profile?.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{profile?.username}</span>
                          {isVip(profile?.vip_expires_at) && (
                            <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 text-[10px] px-1.5">
                              <Crown className="h-2.5 w-2.5 mr-0.5" />
                              VIP
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                          <p className="text-xs text-muted-foreground">Online</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Selected count and send button */}
          {onlineFriends.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {selectedFriends.length} ta do'st tanlandi
              </p>
              <Button
                onClick={handleSendInvites}
                disabled={selectedFriends.length === 0 || sending}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Taklif yuborish
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupGameInvite;
