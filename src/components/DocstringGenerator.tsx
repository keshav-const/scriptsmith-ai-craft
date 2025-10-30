import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocstringGeneratorProps {
  docstring: string;
}

export const DocstringGenerator = ({ docstring }: DocstringGeneratorProps) => {
  const { toast } = useToast();

  if (!docstring) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(docstring);
    toast({
      title: 'Copied to clipboard',
      description: 'Docstring has been copied successfully',
    });
  };

  return (
    <Card className="p-6 glass border-border/50 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Generated Docstrings</h3>
        </div>
        <Button
          variant="glass"
          size="sm"
          onClick={handleCopy}
          className="gap-2 hover-lift"
        >
          <Copy className="h-4 w-4" />
          Copy
        </Button>
      </div>
      
      <pre className="rounded-xl border border-border/50 glass-strong p-4 text-sm text-foreground overflow-x-auto">
        <code>{docstring}</code>
      </pre>
    </Card>
  );
};
