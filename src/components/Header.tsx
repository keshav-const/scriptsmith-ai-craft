import { Code2, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

export const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="glass sticky top-0 z-50 border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 border border-primary/30">
            <Code2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">ScriptSmith</h1>
            <p className="text-xs text-muted-foreground">AI Code Reviewer</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-muted-foreground hidden md:block">
            Powered by Gemini 2.5 Pro
          </div>
          <ThemeToggle />
          {user && (
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-2 hover-lift">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};