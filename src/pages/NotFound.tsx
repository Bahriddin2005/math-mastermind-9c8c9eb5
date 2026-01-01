import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="text-center max-w-md w-full">
        <div className="mb-6 sm:mb-8">
          <div className="text-6xl sm:text-8xl md:text-9xl font-bold text-primary/20 mb-4">
            404
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground mb-3 sm:mb-4">
            Sahifa topilmadi
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8">
            Kechirasiz, qidirilayotgan sahifa mavjud emas yoki o'chirilgan.
          </p>
        </div>
        <Button 
          size="lg"
          className="gap-2 min-h-[44px] w-full sm:w-auto"
          onClick={() => window.location.href = "/"}
        >
          <Home className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-sm sm:text-base">Bosh sahifaga qaytish</span>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
