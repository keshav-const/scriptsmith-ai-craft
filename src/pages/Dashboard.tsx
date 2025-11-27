import { useState } from 'react';
import { Header } from '@/components/Header';
import { CodeEditor } from '@/components/CodeEditor';
import { AnalysisResults } from '@/components/AnalysisResults';
import { HistoryList } from '@/components/HistoryList';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Undo2, Redo2 } from 'lucide-react';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [analysis, setAnalysis] = useState<any>(null);
  const [qualityScore, setQualityScore] = useState<number | undefined>(undefined);
  const [scoreBreakdown, setScoreBreakdown] = useState<any>(undefined);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [codeHistory, setCodeHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { toast } = useToast();
  const { user } = useAuth();

  const analyzeCode = async () => {
    if (!code.trim()) {
      toast({
        title: 'No code provided',
        description: 'Please enter some code to analyze',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Not authenticated',
        description: 'Please log in to analyze code',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-code', {
        body: { code, language, userId: user.id },
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      setQualityScore(data.qualityScore);
      setScoreBreakdown(data.scoreBreakdown);
      toast({
        title: 'Analysis complete',
        description: 'Your code has been analyzed successfully',
      });
    } catch (error) {
      console.error('Error analyzing code:', error);
      toast({
        title: 'Analysis failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  const applyCodeFix = (newCode: string, startLine?: number, endLine?: number) => {
    // Save current code to history before applying fix
    const newHistory = codeHistory.slice(0, historyIndex + 1);
    newHistory.push(code);
    setCodeHistory(newHistory);
    setHistoryIndex(newHistory.length);
    let finalCode: string;
    if (startLine !== undefined && endLine !== undefined) {
      // Line-based replacement
      const lines = code.split('\n');
      const before = lines.slice(0, startLine - 1);
      const after = lines.slice(endLine);
      const newLines = newCode.split('\n');

      finalCode = [...before, ...newLines, ...after].join('\n');

      toast({
        title: 'Fix applied!',
        description: `Updated lines ${startLine}-${endLine}`,
      });
    } else {
      // Full file replacement (fallback)
      finalCode = newCode;

      toast({
        title: 'Code replaced!',
        description: 'Full code has been updated',
      });
    }
    // Apply the new code
    setCode(finalCode);
  };
  // Undo code change
  const undoCodeChange = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCode(codeHistory[historyIndex - 1]);
      toast({
        title: 'Undone',
        description: 'Reverted to previous code',
      });
    }
  };
  // Redo code change
  const redoCodeChange = () => {
    if (historyIndex < codeHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCode(codeHistory[historyIndex + 1]);
      toast({
        title: 'Redone',
        description: 'Restored code change',
      });
    }
  };
  const handleSelectAnalysis = (selectedAnalysis: any, selectedCode: string, selectedLanguage: string) => {
    setAnalysis(selectedAnalysis);
    setCode(selectedCode);
    setLanguage(selectedLanguage);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Header />

        <main className="container mx-auto px-4 py-8">
          <Tabs defaultValue="analyze" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8 glass border-border/50">
              <TabsTrigger value="analyze" className="data-[state=active]:bg-primary/20">
                Analyze Code
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-primary/20">
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analyze" className="space-y-6">
              <motion.div
                className="grid gap-6 lg:grid-cols-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Sticky code editor section */}
                <div className="space-y-4 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-auto">
                  <CodeEditor
                    value={code}
                    onChange={setCode}
                    language={language}
                    onLanguageChange={setLanguage}
                  />
                  {/* Undo/Redo buttons */}
                  {codeHistory.length > 0 && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={undoCodeChange}
                        disabled={historyIndex <= 0}
                        className="flex-1"
                      >
                        <Undo2 className="h-4 w-4 mr-2" />
                        Undo
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={redoCodeChange}
                        disabled={historyIndex >= codeHistory.length - 1}
                        className="flex-1"
                      >
                        <Redo2 className="h-4 w-4 mr-2" />
                        Redo
                      </Button>
                    </div>
                  )}
                  <Button
                    onClick={analyzeCode}
                    disabled={isAnalyzing || !code.trim()}
                    className="w-full hover-lift"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Code'
                    )}
                  </Button>
                </div>

                {/* Scrollable analysis results section */}
                <div className="lg:min-h-screen">
                  {analysis && (
                    <AnalysisResults
                      analysis={analysis}
                      language={language}
                      qualityScore={qualityScore}
                      scoreBreakdown={scoreBreakdown}
                      onApplyFix={applyCodeFix}
                      currentCode={code}
                    />
                  )}
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="history">
              <div className="max-w-4xl mx-auto">
                <HistoryList onSelectAnalysis={handleSelectAnalysis} />
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  );
};

export default Dashboard;
