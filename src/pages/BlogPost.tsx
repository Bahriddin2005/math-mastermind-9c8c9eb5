import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageBackground } from '@/components/layout/PageBackground';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BlogComments } from '@/components/BlogComments';
import { BlogLikeButton } from '@/components/BlogLikeButton';
import { useSound } from '@/hooks/useSound';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Calendar,
  Eye,
  BookOpen,
  Brain,
  Calculator,
  Lightbulb,
  Target,
  TrendingUp,
  Sparkles,
  Loader2
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  created_at: string;
  read_time: string;
  icon: string;
  gradient: string;
  views_count: number | null;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Brain, Calculator, Lightbulb, Target, TrendingUp, Sparkles, BookOpen
};

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { soundEnabled, toggleSound } = useSound();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .maybeSingle();

    if (data) {
      setPost(data);
      // Increment views count
      await supabase.rpc('increment_blog_views', { post_id: id });
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <PageBackground className="flex flex-col">
        <Navbar soundEnabled={soundEnabled} onToggleSound={toggleSound} />
        <main className="flex-1 container px-3 sm:px-4 py-8 sm:py-12 flex items-center justify-center">
          <div className="text-center max-w-md w-full">
            <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-xl sm:text-2xl font-bold mb-2">Maqola topilmadi</h1>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">Bu maqola mavjud emas yoki o'chirilgan</p>
            <Button size="lg" className="min-h-[44px] w-full sm:w-auto" onClick={() => navigate('/blog')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Blogga qaytish
            </Button>
          </div>
        </main>
        <Footer />
      </PageBackground>
    );
  }

  const Icon = ICON_MAP[post.icon] || BookOpen;

  return (
    <PageBackground className="flex flex-col">
      <Navbar soundEnabled={soundEnabled} onToggleSound={toggleSound} />

      <main className="flex-1">
        {/* Hero Header */}
        <div className={`bg-gradient-to-br ${post.gradient} py-12 sm:py-16 md:py-24`}>
          <div className="container px-3 sm:px-4">
            <div className="max-w-3xl mx-auto text-center text-white">
              <Button 
                variant="ghost" 
                size="sm"
                className="mb-4 sm:mb-6 text-white/80 hover:text-white hover:bg-white/10 h-9 sm:h-10"
                onClick={() => navigate('/blog')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Blogga qaytish</span>
                <span className="sm:hidden">Orqaga</span>
              </Button>
              
              <Badge className="mb-3 sm:mb-4 bg-white/20 text-white hover:bg-white/30 text-xs sm:text-sm">
                {post.category}
              </Badge>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4 sm:mb-6 px-2">
                {post.title}
              </h1>
              
              <p className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8 px-2">
                {post.excerpt}
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 text-white/80 text-xs sm:text-sm px-2">
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {post.author}
                </span>
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{formatDate(post.created_at)}</span>
                  <span className="sm:hidden">{new Date(post.created_at).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}</span>
                </span>
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {post.read_time}
                </span>
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {(post.views_count || 0) + 1}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container px-3 sm:px-4 py-6 sm:py-8 md:py-12">
          <article className="max-w-3xl mx-auto">
            <div className="prose prose-sm sm:prose-base md:prose-lg dark:prose-invert max-w-none">
              {post.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-foreground/90 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Like Button */}
            <div className="flex justify-center mt-6 sm:mt-8">
              <BlogLikeButton postId={post.id} />
            </div>

            {/* Comments Section */}
            <BlogComments postId={post.id} />

            {/* Share & Navigate */}
            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
              <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => navigate('/blog')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="text-sm sm:text-base">Boshqa maqolalar</span>
              </Button>
              
              <Button size="sm" className="w-full sm:w-auto" onClick={() => navigate('/train')}>
                <span className="text-sm sm:text-base">Mashq qilish</span>
              </Button>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </PageBackground>
  );
};

export default BlogPost;
