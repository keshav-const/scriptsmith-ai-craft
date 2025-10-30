import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 hover-lift rounded-xl"
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4 transition-transform duration-300" />
      ) : (
        <Sun className="h-4 w-4 transition-transform duration-300" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
