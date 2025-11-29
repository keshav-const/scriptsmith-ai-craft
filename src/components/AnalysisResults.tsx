import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExportButtons } from '@/components/ExportButtons';
import { AlertCircle, CheckCircle2, Lightbulb, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RatingMeter } from './RatingMeter';
import { DocstringGenerator } from './DocstringGenerator';
import { QualityScoreBadge } from './QualityScoreBadge';
import { motion } from 'framer-motion';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// Utility function to unescape JSON strings
const unescapeText = (text: string): string => {
  if (!text) return '';
  try {
    // If the text looks like an escaped JSON string, unescape it
    if (text.includes('\\n') || text.includes('\\t') || text.includes('\\"')) {
      return text
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
    }
    return text;
  } catch {
    return text;
  }
};


interface AnalysisData {
  explanation: string;
  docstring?: string;
  rating?: {
    complexity?: 'low' | 'medium' | 'high';
    readability?: 'low' | 'medium' | 'high';
    maintainability?: number;
  };
  lineByLine?: Array<{
    line: number;
    content: string;
    explanation: string;
  }>;
  issues?: Array<{
    severity: 'high' | 'medium' | 'low';
    line?: number;
    description: string;
    suggestion: string;
  }>;
  improvements?: Array<{
    title: string;
    description: string;
    startLine?: number;
    endLine?: number;
    code?: string;
  }>;
}

// interface AnalysisResultsProps {
//   analysis: AnalysisData;
//   language: string;
//   qualityScore?: number;
//   scoreBreakdown?: {
//     baseScore: number;
//     issuesPenalty: number;
//     complexityPenalty: number;
//     readabilityBonus: number;
//     maintainabilityScore: number;
//   };
//   onApplyFix?: (newCode: string, startLine?: number, endLine?: number) => void;

//   currentCode?: string;
// }
interface AnalysisResultsProps {
  analysis: AnalysisData;
  language: string;
  qualityScore?: number;
  scoreBreakdown?: {
    baseScore: number;
    issuesPenalty: number;
    complexityPenalty: number;
    readabilityBonus: number;
    maintainabilityScore: number;
  };
  onApplyFix?: (newCode: string, startLine?: number, endLine?: number, fixId?: string) => void;
  currentCode?: string;
  appliedFixes?: Set<string>;
}
const severityColors = {
  high: 'destructive',
  medium: 'default',
  low: 'secondary',
} as const;

export const AnalysisResults = ({ analysis, language, qualityScore, scoreBreakdown, onApplyFix, currentCode, appliedFixes = new Set() }: AnalysisResultsProps) => {
  const { toast } = useToast();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'Code has been copied successfully',
    });
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Export Buttons */}
      <Card className="p-6 glass border-border/50 shadow-lg">
        <h3 className="mb-3 text-lg font-semibold text-foreground">Export Options</h3>
        <ExportButtons
          analysis={analysis}
          docstring={analysis.docstring}
          language={language}
        />
      </Card>

      {/* Quality Score Badge */}
      {qualityScore !== undefined && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <QualityScoreBadge score={qualityScore} breakdown={scoreBreakdown} />
        </motion.div>
      )}

      {/* Overall Explanation */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="p-6 glass border-border/50 shadow-lg">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-success" />
            <div className="flex-1">
              <h3 className="mb-2 text-lg font-semibold text-foreground">Code Overview</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{unescapeText(analysis.explanation)}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quality Metrics */}
      {analysis.rating && <RatingMeter rating={analysis.rating} />}

      {/* Generated Docstrings */}
      {analysis.docstring && <DocstringGenerator docstring={analysis.docstring} />}

      {/* Line by Line Analysis */}
      {analysis.lineByLine && analysis.lineByLine.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="p-6 glass border-border/50 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Line-by-Line Breakdown</h3>
            <div className="space-y-4">
              {analysis.lineByLine.map((item, idx) => (
                <div key={idx} className="border-l-2 border-primary/30 pl-4">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">Line {item.line}</span>
                    <code className="rounded-lg glass px-2 py-0.5 text-xs font-mono text-foreground">
                      {item.content}
                    </code>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.explanation}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Issues */}
      {analysis.issues && analysis.issues.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="p-6 glass border-border/50 shadow-lg">
            <div className="mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <h3 className="text-lg font-semibold text-foreground">Issues & Code Smells</h3>
            </div>
            <div className="space-y-4">
              {analysis.issues.map((issue, idx) => (
                <div key={idx} className="rounded-xl glass-strong p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant={severityColors[issue.severity]}>
                      {issue.severity.toUpperCase()}
                    </Badge>
                    {issue.line && (
                      <span className="text-xs text-muted-foreground">Line {issue.line}</span>
                    )}
                  </div>
                  <p className="mb-2 text-sm font-medium text-foreground">{issue.description}</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Suggestion:</span> {issue.suggestion}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Improvements */}
      {analysis.improvements && analysis.improvements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="p-6 glass border-border/50 shadow-lg">
            <div className="mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Suggested Improvements</h3>
            </div>
            <div className="space-y-6">
              {analysis.improvements.map((improvement, idx) => (
                <div key={idx}>
                  <h4 className="mb-2 font-medium text-foreground">{improvement.title}</h4>
                  <p className="mb-3 text-sm text-muted-foreground">{improvement.description}</p>
                  {improvement.code && (
                    <Collapsible
                      open={openSections[`improvement-${idx}`]}
                      onOpenChange={() => toggleSection(`improvement-${idx}`)}
                    >
                      <div className="rounded-xl glass-strong overflow-hidden">
                        <CollapsibleTrigger asChild>
                          <button className="flex w-full items-center justify-between glass-strong px-4 py-3 text-sm font-medium text-foreground hover:bg-primary/5 transition-all duration-300">
                            <span>Show Suggested Fix</span>
                            {openSections[`improvement-${idx}`] ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="relative">
                            {onApplyFix && improvement.code && (
                              (() => {
                                const fixId = `fix-${idx}-${improvement.startLine}-${improvement.endLine}`;
                                const isApplied = appliedFixes.has(fixId);

                                return (
                                  <Button
                                    variant={isApplied ? "secondary" : "default"}
                                    size="sm"
                                    className={`absolute left-2 top-2 z-10 ${isApplied ? 'opacity-60' : 'hover-lift bg-primary'}`}
                                    onClick={() => onApplyFix(
                                      improvement.code || '',
                                      improvement.startLine,
                                      improvement.endLine,
                                      fixId
                                    )}
                                    disabled={isApplied}
                                  >
                                    {isApplied ? (
                                      <>
                                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                                        Applied
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Apply Fix
                                      </>
                                    )}
                                    {improvement.startLine && improvement.endLine && (
                                      <span className="ml-1 text-xs opacity-75">
                                        (L{improvement.startLine}-{improvement.endLine})
                                      </span>
                                    )}
                                  </Button>
                                );
                              })()
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-2 z-10 hover-lift"
                              onClick={() => copyToClipboard(improvement.code || '')}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <pre className="m-0 overflow-x-auto rounded-b-xl bg-card p-4 pt-10 text-sm">
                              <code className="font-mono text-foreground">
                                {improvement.code}
                              </code>
                            </pre>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};
