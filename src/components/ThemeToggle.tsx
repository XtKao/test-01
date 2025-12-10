import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        'h-10 w-10 rounded-full transition-all duration-300',
        'bg-secondary/50 hover:bg-secondary',
        'hover:scale-110 active:scale-95'
      )}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 text-foreground transition-transform duration-300" />
      ) : (
        <Sun className="h-5 w-5 text-foreground transition-transform duration-300" />
      )}
    </Button>
  );
}
