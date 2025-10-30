import { Editor } from '@monaco-editor/react';
import { Card } from '@/components/ui/card';

interface CodeEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language: string;
  onLanguageChange: (language: string) => void;
}

const LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'csharp',
  'cpp',
  'go',
  'rust',
  'ruby',
  'php',
  'sql',
  'html',
  'css',
];

export const CodeEditor = ({ value, onChange, language, onLanguageChange }: CodeEditorProps) => {
  return (
    <Card className="overflow-hidden glass border-border/50 shadow-lg">
      <div className="flex items-center justify-between border-b border-border/50 glass-strong px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Code Input</h2>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="rounded-lg border border-border/50 glass px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <Editor
        height="500px"
        language={language}
        value={value}
        onChange={onChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        }}
      />
    </Card>
  );
};