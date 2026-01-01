import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageCircle, 
  Instagram, 
  Youtube,
  Heart,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

const footerLinks = {
  platform: [
    { label: 'Bosh sahifa', href: '/' },
    { label: 'Mashq qilish', href: '/train' },
    { label: 'Video darslar', href: '/courses' },
    { label: 'Tariflar', href: '/pricing' },
    { label: 'Blog', href: '/blog' },
  ],
  support: [
    { label: "Bog'lanish", href: '/contact' },
    { label: "Ko'p beriladigan savollar", href: '/faq' },
    { label: 'Yordam markazi', href: '/help' },
  ],
  legal: [
    { label: 'Maxfiylik siyosati', href: '/privacy' },
    { label: 'Foydalanish shartlari', href: '/terms' },
  ],
};

const socialLinks = [
  { icon: MessageCircle, href: 'https://t.me/iqromax', label: 'Telegram', color: 'group-hover:text-blue-400', bgHover: 'group-hover:bg-blue-500/20' },
  { icon: Instagram, href: 'https://instagram.com/iqromax', label: 'Instagram', color: 'group-hover:text-pink-400', bgHover: 'group-hover:bg-pink-500/20' },
  { icon: Youtube, href: 'https://youtube.com/@iqromax', label: 'YouTube', color: 'group-hover:text-red-400', bgHover: 'group-hover:bg-red-500/20' },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden">
      {/* Top gradient border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-secondary/50" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      {/* Newsletter Section */}
      <div className="relative border-b border-border/50">
        <div className="container px-4 py-10 sm:py-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-sm font-medium text-primary mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                IQROMAX
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-2">
                Biz bilan bog'laning
              </h3>
              <p className="text-muted-foreground text-sm max-w-md">
                Eng so'nggi yangiliklar va maxsus takliflardan xabardor bo'ling
              </p>
            </div>
            
            {/* Social Links - Large */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative w-12 h-12 sm:w-14 sm:h-14 min-w-[48px] min-h-[48px] sm:min-w-[56px] sm:min-h-[56px] rounded-2xl bg-secondary/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground transition-all duration-300 hover:scale-105 active:scale-95 ${social.bgHover} border border-border/50 hover:border-primary/30 touch-manipulation`}
                  aria-label={social.label}
                >
                  <social.icon className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors ${social.color}`} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="relative container px-4 py-8 sm:py-10 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Logo size="md" />
            <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
              Mental arifmetika bo'yicha eng yaxshi onlayn platforma. 
              Miyangizni rivojlantiring va tez hisoblashni o'rganing.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Platforma</h4>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href} 
                    className="group inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors text-sm min-h-[44px] touch-manipulation py-1"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Yordam</h4>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href} 
                    className="group inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors text-sm min-h-[44px] touch-manipulation py-1"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <h4 className="font-display font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Aloqa</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="mailto:info@iqromax.uz" 
                  className="group flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors text-sm min-h-[44px] touch-manipulation"
                >
                  <div className="h-11 w-11 sm:h-9 sm:w-9 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors flex-shrink-0">
                    <Mail className="h-4 w-4 sm:h-4 sm:w-4" />
                  </div>
                  <span className="break-all">info@iqromax.uz</span>
                </a>
              </li>
              <li>
                <a 
                  href="tel:+998901234567" 
                  className="group flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors text-sm min-h-[44px] touch-manipulation"
                >
                  <div className="h-11 w-11 sm:h-9 sm:w-9 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors flex-shrink-0">
                    <Phone className="h-4 w-4 sm:h-4 sm:w-4" />
                  </div>
                  <span>+998 90 123 45 67</span>
                </a>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm min-h-[44px]">
                <div className="h-11 w-11 sm:h-9 sm:w-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 sm:h-4 sm:w-4" />
                </div>
                <span>Toshkent, O'zbekiston</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-border/50">
        <div className="container px-4 py-5 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 text-center sm:text-left">
              © {currentYear} IQroMax. 
              <span className="hidden sm:inline">Barcha huquqlar himoyalangan.</span>
              <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 mx-0.5" />
              <span className="hidden sm:inline">O'zbekistonda ishlab chiqilgan.</span>
            </p>
            
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6">
              {footerLinks.legal.map((link) => (
                <Link 
                  key={link.href}
                  to={link.href} 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors min-h-[44px] flex items-center touch-manipulation"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
