import { motion } from 'framer-motion';
import { Trophy, TrendingUp, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface QualityScoreBadgeProps {
    score: number;
    breakdown?: {
        baseScore: number;
        issuesPenalty: number;
        complexityPenalty: number;
        readabilityBonus: number;
        maintainabilityScore: number;
    };
}

export const QualityScoreBadge = ({ score, breakdown }: QualityScoreBadgeProps) => {
    // Determine color based on score
    const getScoreColor = () => {
        if (score >= 80) return { bg: 'bg-green-500', text: 'text-green-500', ring: 'ring-green-500' };
        if (score >= 60) return { bg: 'bg-yellow-500', text: 'text-yellow-500', ring: 'ring-yellow-500' };
        return { bg: 'bg-red-500', text: 'text-red-500', ring: 'ring-red-500' };
    };

    const getScoreGrade = () => {
        if (score >= 90) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        if (score >= 50) return 'D';
        return 'F';
    };

    const colors = getScoreColor();
    const grade = getScoreGrade();

    // Calculate circle progress
    const circumference = 2 * Math.PI * 45; // radius = 45
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <Card className="p-6 glass border-border/50">
            <div className="flex items-center gap-6">
                {/* Circular Score Badge */}
                <div className="relative">
                    <svg className="w-32 h-32 transform -rotate-90">
                        {/* Background circle */}
                        <circle
                            cx="64"
                            cy="64"
                            r="45"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-muted opacity-20"
                        />
                        {/* Progress circle */}
                        <motion.circle
                            cx="64"
                            cy="64"
                            r="45"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                            className={colors.text}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            style={{
                                strokeDasharray: circumference,
                            }}
                        />
                    </svg>

                    {/* Score text in center */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: 'spring' }}
                            className={`text-3xl font-bold ${colors.text}`}
                        >
                            {score}
                        </motion.div>
                        <div className="text-sm text-muted-foreground">/ 100</div>
                    </div>
                </div>

                {/* Score Details */}
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                        <Trophy className={`w-5 h-5 ${colors.text}`} />
                        <h3 className="text-xl font-semibold">Code Quality Score</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${colors.bg} text-white`}>
                            Grade {grade}
                        </span>
                    </div>

                    {breakdown && (
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Base Score</span>
                                <span className="font-medium">+{breakdown.baseScore}</span>
                            </div>
                            {breakdown.issuesPenalty > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Issues Penalty
                                    </span>
                                    <span className="font-medium text-red-500">-{breakdown.issuesPenalty}</span>
                                </div>
                            )}
                            {breakdown.complexityPenalty > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Complexity Penalty</span>
                                    <span className="font-medium text-orange-500">-{breakdown.complexityPenalty}</span>
                                </div>
                            )}
                            {breakdown.readabilityBonus !== 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Readability</span>
                                    <span className={`font-medium ${breakdown.readabilityBonus > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {breakdown.readabilityBonus > 0 ? '+' : ''}{breakdown.readabilityBonus}
                                    </span>
                                </div>
                            )}
                            {breakdown.maintainabilityScore !== 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        Maintainability
                                    </span>
                                    <span className={`font-medium ${breakdown.maintainabilityScore > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {breakdown.maintainabilityScore > 0 ? '+' : ''}{breakdown.maintainabilityScore}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};
