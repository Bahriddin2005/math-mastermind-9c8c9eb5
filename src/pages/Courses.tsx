import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageBackground } from '@/components/layout/PageBackground';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useSound } from '@/hooks/useSound';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  BookOpen, 
  Loader2,
  GraduationCap,
  Award,
  Sparkles,
  ArrowRight,
  Users,
  Clock,
  Star,
  TrendingUp
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  difficulty: string;
  lessons_count?: number;
  completed_lessons?: number;
}

const difficultyConfig: Record<string, { bg: string; text: string; label: string; gradient: string }> = {
  beginner: { 
    bg: 'bg-emerald-500/10', 
    text: 'text-emerald-500', 
    label: "Boshlang'ich",
    gradient: 'from-emerald-500/20 via-emerald-400/10 to-teal-500/5'
  },
  intermediate: { 
    bg: 'bg-amber-500/10', 
    text: 'text-amber-500', 
    label: "O'rta",
    gradient: 'from-amber-500/20 via-orange-400/10 to-yellow-500/5'
  },
  advanced: { 
    bg: 'bg-rose-500/10', 
    text: 'text-rose-500', 
    label: "Murakkab",
    gradient: 'from-rose-500/20 via-pink-400/10 to-red-500/5'
  },
};

const Courses = () => {
  const navigate = useNavigate();
  const { soundEnabled, toggleSound } = useSound();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<Record<string, { total: number; completed: number }>>({});

  useEffect(() => {
    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    const { data: coursesData } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('order_index', { ascending: true });

    if (coursesData) {
      const coursesWithLessons = await Promise.all(
        coursesData.map(async (course) => {
          const { count } = await supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id)
            .eq('is_published', true);

          return { ...course, lessons_count: count || 0 };
        })
      );

      setCourses(coursesWithLessons);

      if (user) {
        const progressMap: Record<string, { total: number; completed: number }> = {};
        
        for (const course of coursesWithLessons) {
          const { data: lessons } = await supabase
            .from('lessons')
            .select('id')
            .eq('course_id', course.id)
            .eq('is_published', true);

          if (lessons && lessons.length > 0) {
            const lessonIds = lessons.map(l => l.id);
            const { count } = await supabase
              .from('user_lesson_progress')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .eq('completed', true)
              .in('lesson_id', lessonIds);

            progressMap[course.id] = {
              total: lessons.length,
              completed: count || 0
            };
          }
        }
        setUserProgress(progressMap);
      }
    }
    setLoading(false);
  };

  return (
    <PageBackground className="flex flex-col">
      <Navbar soundEnabled={soundEnabled} onToggleSound={toggleSound} />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-28">
          {/* Animated background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-accent/15 to-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
          </div>
          
          {/* Floating elements */}
          <div className="absolute top-16 right-[15%] opacity-60 hidden lg:block animate-bounce-soft">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm flex items-center justify-center rotate-12 shadow-lg">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="absolute bottom-20 left-[10%] opacity-40 hidden lg:block animate-bounce-soft" style={{ animationDelay: '0.5s' }}>
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 backdrop-blur-sm flex items-center justify-center -rotate-12 shadow-lg">
              <BookOpen className="h-7 w-7 text-accent" />
            </div>
          </div>
          <div className="absolute top-32 left-[20%] opacity-30 hidden xl:block animate-bounce-soft" style={{ animationDelay: '1s' }}>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-success/20 to-success/10 backdrop-blur-sm flex items-center justify-center rotate-6 shadow-md">
              <Star className="h-6 w-6 text-success" />
            </div>
          </div>

          <div className="container px-3 sm:px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/15 to-accent/10 text-primary mb-8 opacity-0 animate-slide-up border border-primary/20 shadow-lg shadow-primary/5" style={{ animationFillMode: 'forwards' }}>
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-semibold">Professional video darsliklar</span>
                <TrendingUp className="h-4 w-4 text-accent" />
              </div>
              
              {/* Main title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-display font-bold text-foreground mb-6 sm:mb-8 opacity-0 animate-slide-up leading-tight" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
                Mental arifmetika
                <br />
                <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">kurslari</span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-12 px-4 opacity-0 animate-slide-up leading-relaxed" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
                Boshlang'ich darajadan professional darajagacha video darslarni ko'ring, 
                mashq qiling va natijalaringizni kuzating.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 opacity-0 animate-slide-up" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg dark-glow-card">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md shadow-primary/20">
                    <BookOpen className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-foreground">{courses.length}+</p>
                    <p className="text-sm text-muted-foreground">Kurslar</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg dark-glow-card">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-md shadow-accent/20">
                    <Users className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-foreground">1000+</p>
                    <p className="text-sm text-muted-foreground">O'quvchilar</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg dark-glow-card">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-success to-success/80 flex items-center justify-center shadow-md shadow-success/20">
                    <Clock className="h-6 w-6 text-success-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-foreground">50+</p>
                    <p className="text-sm text-muted-foreground">Soat video</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="container px-4 py-12 md:py-20">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="text-center">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
                    <GraduationCap className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-muted-foreground mt-6 font-medium">Kurslar yuklanmoqda...</p>
                </div>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-24">
                <div className="h-28 w-28 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center mx-auto mb-8 shadow-xl">
                  <BookOpen className="h-14 w-14 text-primary/60" />
                </div>
                <h2 className="text-3xl font-display font-bold mb-4">Kurslar hali mavjud emas</h2>
                <p className="text-muted-foreground max-w-md mx-auto text-lg">
                  Tez orada yangi professional video darslar qo'shiladi. Kuzatib boring!
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course, index) => {
                  const progress = userProgress[course.id];
                  const progressPercent = progress ? (progress.completed / progress.total) * 100 : 0;
                  const isCompleted = progress && progress.completed === progress.total && progress.total > 0;
                  const difficulty = difficultyConfig[course.difficulty] || difficultyConfig.beginner;

                  return (
                    <Card 
                      key={course.id} 
                      className="group relative overflow-visible border-0 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-3 opacity-0 animate-slide-up bg-gradient-to-br from-card via-card to-secondary/20 backdrop-blur-sm"
                      style={{ animationDelay: `${400 + index * 100}ms`, animationFillMode: 'forwards' }}
                      onClick={() => {
                        sessionStorage.setItem('scrollPos_/courses', window.scrollY.toString());
                        navigate(`/courses/${course.id}`);
                      }}
                    >
                      {/* Animated gradient border */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/30 via-accent/20 to-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl" />
                      
                      {/* Glow effect */}
                      <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl -z-20" />
                      
                      {/* Background layer */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-card via-card to-secondary/20 z-0" />
                      
                      {/* Content wrapper */}
                      <div className="relative z-10 flex flex-col h-full bg-transparent">
                      
                        {/* Thumbnail */}
                        <div className={`relative h-64 bg-gradient-to-br ${difficulty.gradient} overflow-hidden rounded-t-2xl`}>
                          {course.thumbnail_url ? (
                            <img 
                              src={course.thumbnail_url} 
                              alt={course.title}
                              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center relative">
                              {/* Animated decorative circles */}
                              <div className="absolute top-4 right-4 h-32 w-32 rounded-full bg-gradient-to-br from-primary/30 to-transparent blur-3xl animate-pulse" />
                              <div className="absolute bottom-4 left-4 h-24 w-24 rounded-full bg-gradient-to-br from-accent/30 to-transparent blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
                              <GraduationCap className="h-32 w-32 text-primary/50 group-hover:scale-110 group-hover:text-primary/70 transition-all duration-500 relative z-10" />
                            </div>
                          )}
                          
                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
                          
                          {/* Shimmer effect on hover */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                          
                          {/* Completed badge */}
                          {isCompleted && (
                            <div className="absolute top-5 right-5 z-20 animate-in fade-in slide-in-from-top-2">
                              <Badge className="bg-gradient-to-r from-success via-emerald-500 to-success text-white shadow-2xl shadow-success/50 gap-2 px-5 py-2 border-2 border-success/40 backdrop-blur-md">
                                <Award className="h-5 w-5" />
                                <span className="font-bold text-sm">Tugatilgan</span>
                              </Badge>
                            </div>
                          )}
                          
                          {/* Difficulty badge */}
                          <div className="absolute top-5 left-5 z-20">
                            <Badge className={`${difficulty.bg} ${difficulty.text} font-bold shadow-xl px-5 py-2 border-2 ${difficulty.text.replace('text-', 'border-')}/40 backdrop-blur-md`}>
                              <span className="text-sm">{difficulty.label}</span>
                            </Badge>
                          </div>
                          
                          {/* Play button overlay */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/30 backdrop-blur-sm">
                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center shadow-2xl shadow-primary/60 transform scale-75 group-hover:scale-100 transition-all duration-500 ring-4 ring-primary/40 animate-pulse">
                              <Play className="h-14 w-14 text-primary-foreground ml-1" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      
                        <CardHeader className="pb-4 pt-6 px-6 flex-shrink-0 relative z-10">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center shadow-lg border border-primary/20">
                              <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <span className="text-sm font-bold text-foreground">{course.lessons_count} ta dars</span>
                            </div>
                          </div>
                          <CardTitle className="text-2xl font-bold leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-300 mb-2">
                            {course.title}
                          </CardTitle>
                        </CardHeader>
                        
                        <CardContent className="pt-0 pb-6 px-6 flex-1 flex flex-col relative z-10">
                          <CardDescription className="line-clamp-3 mb-6 text-base leading-relaxed text-foreground/80 flex-1">
                            {course.description}
                          </CardDescription>
                          
                          {/* Progress */}
                          {user && progress && (
                            <div className="space-y-3 mb-6 p-5 rounded-2xl bg-gradient-to-br from-secondary/40 via-secondary/30 to-secondary/40 border border-border/60 shadow-lg">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-foreground flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4 text-primary" />
                                  Jarayon
                                </span>
                                <span className="font-bold text-lg text-foreground">{progress.completed}/{progress.total} dars</span>
                              </div>
                              <div className="relative h-4 bg-secondary rounded-full overflow-hidden shadow-inner">
                                <div 
                                  className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 transition-all duration-700 shadow-lg shadow-primary/40"
                                  style={{ width: `${progressPercent}%` }}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                                </div>
                              </div>
                              {progressPercent > 0 && (
                                <p className="text-xs text-muted-foreground text-center font-semibold">
                                  {Math.round(progressPercent)}% bajarildi
                                </p>
                              )}
                            </div>
                          )}

                          <Button 
                            className={`w-full gap-3 group-hover:gap-4 transition-all duration-300 h-14 text-base font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] ${
                              isCompleted 
                                ? 'bg-gradient-to-r from-secondary via-secondary/90 to-secondary/80 hover:from-secondary/80 hover:via-secondary hover:to-secondary/70 text-foreground border-2 border-border' 
                                : 'bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary hover:to-primary/90 text-primary-foreground shadow-primary/40 hover:shadow-primary/60'
                            }`}
                            variant={isCompleted ? "secondary" : "default"}
                          >
                            {isCompleted ? (
                              <>
                                <Award className="h-6 w-6" />
                                Qayta ko'rish
                                <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
                              </>
                            ) : progress?.completed ? (
                              <>
                                <Play className="h-6 w-6" fill="currentColor" />
                                Davom ettirish
                                <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
                              </>
                            ) : (
                              <>
                                <Play className="h-6 w-6" fill="currentColor" />
                                Boshlash
                                <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </PageBackground>
  );
};

export default Courses;
