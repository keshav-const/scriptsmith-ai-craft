import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gauge, Eye, Wrench } from 'lucide-react';

interface RatingData {
  complexity?: 'low' | 'medium' | 'high';
  readability?: 'low' | 'medium' | 'high';
  maintainability?: number;
}

interface RatingMeterProps {
  rating: RatingData;
}

const severityColors = {
  low: 'bg-success',
  medium: 'bg-warning',
  high: 'bg-destructive',
};

const severityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const RatingMeter = ({ rating }: RatingMeterProps) => {
  if (!rating) return null;

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Code Quality Metrics</h3>
      
      <div className="space-y-4">
        {/* Complexity */}
        {rating.complexity && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Cyclomatic Complexity</span>
              </div>
              <Badge variant={rating.complexity === 'low' ? 'secondary' : rating.complexity === 'medium' ? 'default' : 'destructive'}>
                {severityLabels[rating.complexity]}
              </Badge>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div 
                className={`h-full transition-all ${severityColors[rating.complexity]}`}
                style={{ 
                  width: rating.complexity === 'low' ? '33%' : rating.complexity === 'medium' ? '66%' : '100%' 
                }}
              />
            </div>
          </div>
        )}

        {/* Readability */}
        {rating.readability && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Readability</span>
              </div>
              <Badge variant={rating.readability === 'high' ? 'secondary' : rating.readability === 'medium' ? 'default' : 'destructive'}>
                {severityLabels[rating.readability]}
              </Badge>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div 
                className={`h-full transition-all ${
                  rating.readability === 'high' ? 'bg-success' : 
                  rating.readability === 'medium' ? 'bg-warning' : 
                  'bg-destructive'
                }`}
                style={{ 
                  width: rating.readability === 'high' ? '100%' : rating.readability === 'medium' ? '66%' : '33%' 
                }}
              />
            </div>
          </div>
        )}

        {/* Maintainability */}
        {rating.maintainability !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Maintainability</span>
              </div>
              <span className="text-sm font-bold text-foreground">{rating.maintainability}/10</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div 
                className={`h-full transition-all ${
                  rating.maintainability >= 7 ? 'bg-success' : 
                  rating.maintainability >= 4 ? 'bg-warning' : 
                  'bg-destructive'
                }`}
                style={{ width: `${rating.maintainability * 10}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
