import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { useSound } from '@/hooks/useSound';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Clock, 
  User, 
  ArrowRight,
  Search,
  Brain,
  Lightbulb,
  Target,
  TrendingUp,
  Calculator,
  Sparkles
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  icon: React.ElementType;
  gradient: string;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: "Mental arifmetikaga kirish: Nimadan boshlash kerak?",
    excerpt: "Mental arifmetika - bu miyada hisob-kitob qilish san'ati. Ushbu maqolada siz boshlang'ich qadamlar va asosiy tamoyillar bilan tanishasiz.",
    category: "Boshlang'ich",
    author: "IQroMax jamoasi",
    date: "2024-01-15",
    readTime: "5 daqiqa",
    icon: Brain,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: '2',
    title: "Tez qo'shish va ayirish usullari",
    excerpt: "Ikki xonali sonlarni tez qo'shish va ayirish uchun maxsus texnikalar. Amaliy mashqlar bilan birga.",
    category: "Texnikalar",
    author: "Sardor Usmonov",
    date: "2024-01-12",
    readTime: "8 daqiqa",
    icon: Calculator,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    id: '3',
    title: "Xotirani mustahkamlash mashqlari",
    excerpt: "Mental arifmetika xotirani rivojlantiradi. Bu maqolada xotirani kuchaytirish uchun maxsus mashqlarni o'rganasiz.",
    category: "Mashqlar",
    author: "Nodira Karimova",
    date: "2024-01-10",
    readTime: "6 daqiqa",
    icon: Lightbulb,
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    id: '4',
    title: "Ko'paytirish jadvalini tez yodlash sirlari",
    excerpt: "Ko'paytirish jadvalini o'yin va qiziqarli usullar orqali tez yodlash. Bolalar va kattalar uchun.",
    category: "Maslahatlar",
    author: "IQroMax jamoasi",
    date: "2024-01-08",
    readTime: "7 daqiqa",
    icon: Target,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: '5',
    title: "Kundalik mashqlar rejasi: 30 kunlik dastur",
    excerpt: "Tizimli o'rganish uchun 30 kunlik mashq dasturi. Har kuni 15-20 daqiqa vaqt ajrating va natijani ko'ring.",
    category: "Dasturlar",
    author: "Akmal Rahimov",
    date: "2024-01-05",
    readTime: "10 daqiqa",
    icon: TrendingUp,
    gradient: "from-red-500 to-rose-500",
  },
  {
    id: '6',
    title: "Bolalar uchun o'yin orqali arifmetika",
    excerpt: "Bolalarni mental arifmetikaga qiziqtirish uchun qiziqarli o'yinlar va interaktiv mashqlar.",
    category: "Bolalar uchun",
    author: "Malika Azimova",
    date: "2024-01-02",
    readTime: "5 daqiqa",
    icon: Sparkles,
    gradient: "from-indigo-500 to-violet-500",
  },
];

const categories = ["Barchasi", "Boshlang'ich", "Texnikalar", "Mashqlar", "Maslahatlar", "Dasturlar", "Bolalar uchun"];

const Blog = () => {
  const { soundEnabled, toggleSound } = useSound();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Barchasi');

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Barchasi' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar soundEnabled={soundEnabled} onToggleSound={toggleSound} />

      <main className="flex-1 container px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              <BookOpen className="h-3 w-3 mr-1" />
              Blog
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Maqolalar va maslahatlar
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Mental arifmetika bo'yicha foydali maqolalar, texnikalar va 
              professional maslahatlar bilan tanishing.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="mb-8 space-y-4">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Maqolalarni qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Blog Posts Grid */}
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Maqolalar topilmadi</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => {
                const Icon = post.icon;

                return (
                  <Card 
                    key={post.id}
                    className="group border-border/40 shadow-lg hover:shadow-xl transition-all overflow-hidden"
                  >
                    {/* Gradient Header */}
                    <div className={`h-32 bg-gradient-to-br ${post.gradient} flex items-center justify-center`}>
                      <Icon className="h-12 w-12 text-white/90" />
                    </div>

                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {post.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      <CardDescription className="line-clamp-3">
                        {post.excerpt}
                      </CardDescription>
                    </CardContent>

                    <CardFooter className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          <span className="truncate max-w-[100px]">{post.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="group-hover:text-primary">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Newsletter CTA */}
          <Card className="mt-12 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="py-8 text-center">
              <h3 className="text-2xl font-display font-bold mb-2">
                Yangi maqolalardan xabardor bo'ling
              </h3>
              <p className="text-muted-foreground mb-6">
                Haftalik foydali maslahatlar va yangi maqolalarni elektron pochtangizga oling
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input 
                  placeholder="Email manzilingiz" 
                  type="email"
                  className="flex-1"
                />
                <Button>
                  Obuna bo'lish
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Blog;
