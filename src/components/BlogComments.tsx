import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  MessageCircle, 
  Send, 
  Trash2, 
  Edit2, 
  Loader2,
  User as UserIcon
} from 'lucide-react';

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: {
    username: string;
    avatar_url: string | null;
  };
}

interface BlogCommentsProps {
  postId: string;
}

export const BlogComments = ({ postId }: BlogCommentsProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    const { data: commentsData } = await supabase
      .from('blog_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (commentsData) {
      // Fetch profiles for each comment
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, avatar_url')
        .in('user_id', userIds);

      const commentsWithProfiles = commentsData.map(comment => ({
        ...comment,
        profile: profiles?.find(p => p.user_id === comment.user_id)
      }));

      setComments(commentsWithProfiles);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    const { error } = await supabase
      .from('blog_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: newComment.trim()
      });

    if (error) {
      toast.error("Xatolik yuz berdi");
    } else {
      toast.success("Izoh qo'shildi");
      setNewComment('');
      fetchComments();
    }
    setSubmitting(false);
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;

    const { error } = await supabase
      .from('blog_comments')
      .update({ content: editContent.trim() })
      .eq('id', commentId);

    if (error) {
      toast.error("Xatolik yuz berdi");
    } else {
      toast.success("Izoh yangilandi");
      setEditingId(null);
      setEditContent('');
      fetchComments();
    }
  };

  const handleDelete = async (commentId: string) => {
    const { error } = await supabase
      .from('blog_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      toast.error("Xatolik yuz berdi");
    } else {
      toast.success("Izoh o'chirildi");
      fetchComments();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="mt-8 border-border/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Izohlar ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Form */}
        {user ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Izohingizni yozing..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting || !newComment.trim()}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Yuborish
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-6 bg-secondary/30 rounded-xl">
            <p className="text-muted-foreground">
              Izoh qoldirish uchun tizimga kiring
            </p>
          </div>
        )}

        {/* Comments List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">Hali izohlar yo'q</p>
            <p className="text-sm text-muted-foreground">Birinchi izohni qoldiring!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div 
                key={comment.id} 
                className="flex gap-4 p-4 bg-secondary/20 rounded-xl"
              >
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={comment.profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <UserIcon className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-medium text-foreground">
                      {comment.profile?.username || 'Foydalanuvchi'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  
                  {editingId === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[80px] resize-none"
                      />
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleEdit(comment.id)}
                        >
                          Saqlash
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setEditingId(null);
                            setEditContent('');
                          }}
                        >
                          Bekor qilish
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-foreground/80 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  )}
                  
                  {user?.id === comment.user_id && editingId !== comment.id && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setEditingId(comment.id);
                          setEditContent(comment.content);
                        }}
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-1" />
                        Tahrirlash
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(comment.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        O'chirish
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
