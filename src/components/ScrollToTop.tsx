import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop komponenti - har bir sahifaga kirganda avtomatik ravishda
 * sahifaning yuqori qismiga scroll qiladi yoki orqaga qaytganda
 * saqlangan scroll pozitsiyasini tiklaydi.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();
  const previousPathname = useRef<string>('');
  const isBackNavigation = useRef(false);

  useEffect(() => {
    // Popstate event'ini kuzatish (orqaga/oldinga qaytish)
    const handlePopState = () => {
      isBackNavigation.current = true;
    };

    window.addEventListener('popstate', handlePopState);

    // Scroll pozitsiyasini saqlash (barcha sahifalar uchun)
    const saveScrollPosition = (path: string) => {
      const scrollPos = window.scrollY;
      if (scrollPos >= 0) {
        sessionStorage.setItem(`scrollPos_${path}`, scrollPos.toString());
      }
    };

    // Oldingi sahifadan chiqishdan oldin pozitsiyani saqlash
    if (previousPathname.current && previousPathname.current !== pathname) {
      saveScrollPosition(previousPathname.current);
    }

    // Orqaga qaytish holatida - saqlangan pozitsiyaga qaytish
    if (isBackNavigation.current) {
      // Dashboard'ga qaytganda kartaga scroll qilish
      if (pathname === '/') {
        const dashboardScrollToCard = sessionStorage.getItem('dashboardScrollToCard');
        if (dashboardScrollToCard) {
          setTimeout(() => {
            const offset = 100; // Navbar uchun offset
            window.scrollTo({ top: parseInt(dashboardScrollToCard, 10) - offset, behavior: 'auto' });
            sessionStorage.removeItem('dashboardScrollToCard');
          }, 50);
          isBackNavigation.current = false;
          previousPathname.current = pathname;
          return;
        }
      }
      
      // Boshqa sahifalar uchun saqlangan pozitsiyaga qaytish
      const savedScrollPos = sessionStorage.getItem(`scrollPos_${pathname}`);
      if (savedScrollPos) {
        setTimeout(() => {
          window.scrollTo({ top: parseInt(savedScrollPos, 10), behavior: 'auto' });
        }, 50);
        isBackNavigation.current = false;
        previousPathname.current = pathname;
        return;
      }
    }

    // Yangi sahifaga kirganda - tepaga scroll
    if (!isBackNavigation.current) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    // Scroll o'zgarganda pozitsiyani saqlash
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        saveScrollPosition(pathname);
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    previousPathname.current = pathname;
    isBackNavigation.current = false;

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
      // Chiqishdan oldin pozitsiyani saqlash
      saveScrollPosition(pathname);
    };
  }, [pathname]);

  return null;
};

