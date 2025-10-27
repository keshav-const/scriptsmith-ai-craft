import { useState } from 'react';
import { Header } from '@/components/Header';
import { CodeEditor } from '@/components/CodeEditor';
import { AnalysisResults } from '@/components/AnalysisResults';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Sparkles } from 'lucide-react';

const Index = () => {
  const [code, setCode] = useState('// Paste your code here\nfunction example() {\n  console.log("Hello World");\n}');
  const [language, setLanguage] = useState('javascript');
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast({
        title: 'No code provided',
        description: 'Please enter some code to analyze',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-code', {
        body: { code, language },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysis(data.analysis);
      toast({
        title: 'Analysis complete',
        description: 'Your code has been analyzed successfully',
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis failed',
        description: error instanceof Error ? error.message : 'An error occurred during analysis',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
            Analyze Your Code
          </h2>
          <p className="text-muted-foreground">
            Get instant feedback, explanations, and improvement suggestions powered by AI
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <CodeEditor
              value={code}
              onChange={(value) => setCode(value || '')}
              language={language}
              onLanguageChange={setLanguage}
            />
            
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Analyze Code
                </>
              )}
            </Button>
          </div>

          <div>
            {analysis ? (
              <AnalysisResults analysis={analysis} language={language} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
                <div>
                  <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mb-2 text-lg font-medium text-foreground">No analysis yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter your code and click "Analyze Code" to get started
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;