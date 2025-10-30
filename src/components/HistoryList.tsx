import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { History, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

interface HistoryItem {
  id: string;
  code_text: string;
  language: string;
  created_at: string;
  ai_explanation: any;
}

interface HistoryListProps {
  onSelectAnalysis: (analysis: any, code: string, language: string) => void;
}

export const HistoryList = ({ onSelectAnalysis }: HistoryListProps) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('code_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setHistory(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
      toast({
        title: 'Failed to load history',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 glass">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="p-6 glass">
        <div className="text-center">
          <History className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No analysis history yet</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 glass border-border/50 shadow-lg">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Analysis History</h3>
      <div className="space-y-3">
        {history.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => onSelectAnalysis(item.ai_explanation, item.code_text, item.language)}
            className="w-full rounded-xl border border-border/50 glass p-4 text-left transition-all duration-300 hover:bg-primary/5 hover-lift"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded-md">{item.language}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="line-clamp-2 text-sm text-foreground">
              {item.code_text.substring(0, 100)}...
            </p>
          </motion.button>
        ))}
      </div>
    </Card>
  );
};
