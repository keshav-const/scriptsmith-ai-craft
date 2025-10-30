import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy, Download, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface ExportButtonsProps {
  analysis: any;
  docstring?: string;
  language: string;
}

export const ExportButtons = ({ analysis, docstring, language }: ExportButtonsProps) => {
  const { toast } = useToast();

  const copyDocstring = () => {
    if (!docstring) {
      toast({
        title: 'No docstring',
        description: 'No docstring available to copy',
        variant: 'destructive',
      });
      return;
    }

    navigator.clipboard.writeText(docstring);
    toast({
      title: 'Copied!',
      description: 'Docstring copied to clipboard',
    });
  };

  const copyFullReport = () => {
    const report = `
Code Analysis Report
Language: ${language}

${analysis.explanation || 'No explanation available'}

${analysis.docstring ? `\nDocstring:\n${analysis.docstring}` : ''}

${analysis.rating ? `\nQuality Metrics:
- Complexity: ${analysis.rating.complexity || 'N/A'}
- Readability: ${analysis.rating.readability || 'N/A'}
- Maintainability: ${analysis.rating.maintainability || 'N/A'}` : ''}

${analysis.issues && analysis.issues.length > 0 ? `\nIssues Found:
${analysis.issues.map((issue: any, i: number) => `${i + 1}. [${issue.severity}] ${issue.description}`).join('\n')}` : ''}

${analysis.improvements && analysis.improvements.length > 0 ? `\nSuggested Improvements:
${analysis.improvements.map((imp: any, i: number) => `${i + 1}. ${imp.description}`).join('\n')}` : ''}
    `.trim();

    navigator.clipboard.writeText(report);
    toast({
      title: 'Copied!',
      description: 'Full report copied to clipboard',
    });
  };

  const exportAsPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: 'Popup blocked',
        description: 'Please allow popups to export PDF',
        variant: 'destructive',
      });
      return;
    }

    const report = `
      <html>
        <head>
          <title>Code Analysis Report</title>
          <style>
            body { font-family: 'Satoshi', Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
            h1 { color: #333; }
            h2 { color: #666; margin-top: 20px; }
            pre { background: #f4f4f4; padding: 10px; border-radius: 8px; overflow-x: auto; }
            .metric { margin: 10px 0; }
            .issue { margin: 10px 0; padding: 10px; background: #fff3cd; border-radius: 8px; }
            .improvement { margin: 10px 0; padding: 10px; background: #d1ecf1; border-radius: 8px; }
          </style>
        </head>
        <body>
          <h1>Code Analysis Report</h1>
          <p><strong>Language:</strong> ${language}</p>
          
          <h2>Explanation</h2>
          <p>${analysis.explanation || 'No explanation available'}</p>
          
          ${docstring ? `<h2>Docstring</h2><pre>${docstring}</pre>` : ''}
          
          ${analysis.rating ? `
            <h2>Quality Metrics</h2>
            <div class="metric"><strong>Complexity:</strong> ${analysis.rating.complexity || 'N/A'}</div>
            <div class="metric"><strong>Readability:</strong> ${analysis.rating.readability || 'N/A'}</div>
            <div class="metric"><strong>Maintainability:</strong> ${analysis.rating.maintainability || 'N/A'}</div>
          ` : ''}
          
          ${analysis.issues && analysis.issues.length > 0 ? `
            <h2>Issues Found</h2>
            ${analysis.issues.map((issue: any) => `
              <div class="issue">
                <strong>[${issue.severity}]</strong> ${issue.description}
              </div>
            `).join('')}
          ` : ''}
          
          ${analysis.improvements && analysis.improvements.length > 0 ? `
            <h2>Suggested Improvements</h2>
            ${analysis.improvements.map((imp: any) => `
              <div class="improvement">
                ${imp.description}
              </div>
            `).join('')}
          ` : ''}
        </body>
      </html>
    `;

    printWindow.document.write(report);
    printWindow.document.close();
    printWindow.print();

    toast({
      title: 'Export ready',
      description: 'Print dialog opened for PDF export',
    });
  };

  return (
    <motion.div 
      className="flex flex-wrap gap-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {docstring && (
        <Button variant="glass" size="sm" onClick={copyDocstring} className="gap-2 hover-lift">
          <Copy className="h-4 w-4" />
          Copy Docstring
        </Button>
      )}
      
      <Button variant="glass" size="sm" onClick={copyFullReport} className="gap-2 hover-lift">
        <FileText className="h-4 w-4" />
        Copy Report
      </Button>
      
      <Button variant="glass" size="sm" onClick={exportAsPDF} className="gap-2 hover-lift">
        <Download className="h-4 w-4" />
        Export PDF
      </Button>
    </motion.div>
  );
};
