import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { 
  MessageCircle, 
  User, 
  Bot, 
  Clock, 
  Search,
  Eye,
  Trash2,
  Loader2,
  Calendar,
  Download,
  ArrowLeft,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

interface UserWithChats {
  user_id: string | null;
  username: string;
  avatar_url: string | null;
  session_count: number;
  total_messages: number;
  last_chat: string;
}

interface ChatSession {
  id: string;
  session_id: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  message_count?: number;
  first_message?: string;
}

interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export const ChatHistoryManager = () => {
  const [users, setUsers] = useState<UserWithChats[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithChats | null>(null);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [sessionMessages, setSessionMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    
    // Fetch all sessions
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('chat_sessions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      setLoading(false);
      return;
    }

    // Fetch message counts for each session
    const { data: messagesData } = await supabase
      .from('chat_messages')
      .select('session_id');

    // Fetch profiles for user names
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, username, avatar_url');

    const profileMap = new Map(profilesData?.map(p => [p.user_id, { username: p.username, avatar_url: p.avatar_url }]) || []);
    
    // Count messages per session
    const messageCounts = new Map<string, number>();
    messagesData?.forEach(m => {
      messageCounts.set(m.session_id, (messageCounts.get(m.session_id) || 0) + 1);
    });

    // Group sessions by user
    const userMap = new Map<string, UserWithChats>();
    
    sessionsData?.forEach(session => {
      const key = session.user_id || 'guest';
      const profile = session.user_id ? profileMap.get(session.user_id) : null;
      const msgCount = messageCounts.get(session.session_id) || 0;
      
      if (userMap.has(key)) {
        const existing = userMap.get(key)!;
        existing.session_count += 1;
        existing.total_messages += msgCount;
        if (new Date(session.created_at) > new Date(existing.last_chat)) {
          existing.last_chat = session.created_at;
        }
      } else {
        userMap.set(key, {
          user_id: session.user_id,
          username: profile?.username || (session.user_id ? 'Noma\'lum' : 'Mehmon'),
          avatar_url: profile?.avatar_url || null,
          session_count: 1,
          total_messages: msgCount,
          last_chat: session.created_at
        });
      }
    });

    // Sort by last chat date
    const usersArray = Array.from(userMap.values()).sort((a, b) => 
      new Date(b.last_chat).getTime() - new Date(a.last_chat).getTime()
    );

    setUsers(usersArray);
    setLoading(false);
  };

  const selectUser = async (user: UserWithChats) => {
    setSelectedUser(user);
    setLoadingSessions(true);

    // Fetch sessions for this user
    let query = supabase
      .from('chat_sessions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (user.user_id) {
      query = query.eq('user_id', user.user_id);
    } else {
      query = query.is('user_id', null);
    }

    const { data: sessionsData } = await query;

    // Fetch message counts and first messages
    const { data: messagesData } = await supabase
      .from('chat_messages')
      .select('session_id, content, role')
      .order('created_at', { ascending: true });

    const messageCounts = new Map<string, number>();
    const firstMessages = new Map<string, string>();
    
    messagesData?.forEach(m => {
      messageCounts.set(m.session_id, (messageCounts.get(m.session_id) || 0) + 1);
      if (!firstMessages.has(m.session_id) && m.role === 'user') {
        firstMessages.set(m.session_id, m.content);
      }
    });

    const enrichedSessions = sessionsData?.map(session => ({
      ...session,
      message_count: messageCounts.get(session.session_id) || 0,
      first_message: firstMessages.get(session.session_id) || 'Xabar yo\'q'
    })) || [];

    setSessions(enrichedSessions);
    setLoadingSessions(false);
  };

  const viewSession = async (session: ChatSession) => {
    setSelectedSession(session);
    setDialogOpen(true);
    setLoadingMessages(true);

    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', session.session_id)
      .order('created_at', { ascending: true });

    setSessionMessages((data as ChatMessage[]) || []);
    setLoadingMessages(false);
  };

  const deleteSession = async (sessionId: string) => {
    // Delete messages first
    await supabase.from('chat_messages').delete().eq('session_id', sessionId);
    // Then delete session
    const { error } = await supabase.from('chat_sessions').delete().eq('session_id', sessionId);
    
    if (!error) {
      setSessions(prev => prev.filter(s => s.session_id !== sessionId));
      toast.success("Suhbat o'chirildi");
      setDialogOpen(false);
      // Refresh user stats
      fetchUsers();
    } else {
      toast.error("Xatolik yuz berdi");
    }
  };

  const goBack = () => {
    setSelectedUser(null);
    setSessions([]);
  };

  const exportToCSV = async () => {
    // Fetch all messages
    const { data: messagesData } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (!messagesData || messagesData.length === 0) {
      toast.error("Eksport qilish uchun ma'lumot yo'q");
      return;
    }

    // Create CSV content
    const headers = ['Sana', 'Vaqt', 'Session ID', 'Rol', 'Xabar'];
    const rows = messagesData.map(msg => {
      const date = new Date(msg.created_at);
      return [
        date.toLocaleDateString('uz-UZ'),
        date.toLocaleTimeString('uz-UZ'),
        msg.session_id,
        msg.role === 'user' ? 'Foydalanuvchi' : 'Bot',
        `"${msg.content.replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = '\ufeff' + [headers.join(','), ...rows].join('\n');
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-tarix-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("CSV fayl yuklab olindi");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Bugun';
    if (days === 1) return 'Kecha';
    if (days < 7) return `${days} kun oldin`;
    return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSessions = users.reduce((sum, u) => sum + u.session_count, 0);
  const totalMessages = users.reduce((sum, u) => sum + u.total_messages, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-xl font-bold">{users.length}</p>
            <p className="text-xs text-muted-foreground">Foydalanuvchilar</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4 text-center">
            <MessageCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-xl font-bold">{totalSessions}</p>
            <p className="text-xs text-muted-foreground">Jami suhbatlar</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardContent className="p-4 text-center">
            <Bot className="h-5 w-5 text-purple-500 mx-auto mb-1" />
            <p className="text-xl font-bold">{totalMessages}</p>
            <p className="text-xs text-muted-foreground">Jami xabarlar</p>
          </CardContent>
        </Card>
      </div>

      {selectedUser ? (
        // User's Sessions View
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Button variant="ghost" size="icon" onClick={goBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 flex-1">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedUser.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10">
                  {selectedUser.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {selectedUser.username}
                  {!selectedUser.user_id && (
                    <Badge variant="secondary" className="text-xs">Mehmon</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {selectedUser.session_count} suhbat • {selectedUser.total_messages} xabar
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingSessions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Suhbatlar topilmadi</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 rounded-xl border bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                      onClick={() => viewSession(session)}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <MessageCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {session.first_message?.substring(0, 60)}
                            {(session.first_message?.length || 0) > 60 ? '...' : ''}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(session.created_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {session.message_count} xabar
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            viewSession(session);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(session.session_id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      ) : (
        // Users List View
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Foydalanuvchi qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Users List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Chat tarixi</CardTitle>
                <CardDescription>Foydalanuvchilar va ularning suhbatlari</CardDescription>
              </div>
              <Button onClick={exportToCSV} variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                CSV eksport
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Foydalanuvchilar topilmadi</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.user_id || 'guest'}
                        className="flex items-center justify-between p-4 rounded-xl border bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                        onClick={() => selectUser(user)}
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{user.username}</p>
                              {!user.user_id && (
                                <Badge variant="secondary" className="text-xs">Mehmon</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {user.session_count} suhbat
                              </span>
                              <span className="flex items-center gap-1">
                                <Bot className="h-3 w-3" />
                                {user.total_messages} xabar
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatRelativeDate(user.last_chat)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Session Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Suhbat: {selectedUser?.username}
            </DialogTitle>
          </DialogHeader>
          
          {loadingMessages ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {sessionMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-secondary rounded-bl-md'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {msg.role === 'user' ? (
                          <User className="h-3 w-3" />
                        ) : (
                          <Bot className="h-3 w-3" />
                        )}
                        <span className="text-xs opacity-70">
                          {new Date(msg.created_at).toLocaleTimeString('uz-UZ', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
