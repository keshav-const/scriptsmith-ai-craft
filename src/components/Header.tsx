import { Code2 } from 'lucide-react';

export const Header = () => {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Code2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">ScriptSmith</h1>
            <p className="text-xs text-muted-foreground">AI Code Reviewer & Explainer</p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Powered by Gemini 2.5 Pro
        </div>
      </div>
    </header>
  );
};