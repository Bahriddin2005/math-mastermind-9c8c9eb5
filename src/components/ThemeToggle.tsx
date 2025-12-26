import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="icon" size="icon" className="opacity-50">
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="icon"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={theme === 'dark' ? "Yorug' rejim" : "Qorong'u rejim"}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-warning" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
};
