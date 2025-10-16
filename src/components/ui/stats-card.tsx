import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  className?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatsCard = ({ title, value, icon, className, trend }: StatsCardProps) => {
  return (
    <Card className={cn(
      "hover:shadow-lg transition-all duration-300 ease-out group relative overflow-hidden",
      className
    )}>
      {/* Effet de brillance au hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

      <CardContent className="p-4 sm:p-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-1 sm:space-y-2 flex-1 pr-4">
            <p className="text-xs sm:text-sm text-muted-foreground font-medium transition-colors duration-200 group-hover:text-foreground">
              {title}
            </p>
            <p className="text-sm font-bold text-foreground whitespace-normal break-words leading-tight">
              {value}
            </p>
            {trend && (
              <p className={cn(
                "text-xs font-medium inline-flex items-center gap-1 transition-all duration-200 hover:scale-105",
                trend.isPositive ? "text-secondary" : "text-destructive"
              )}>
                <span className={cn(
                  "inline-block w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent",
                  trend.isPositive
                    ? "border-b-4 border-b-secondary transform -translate-y-0.5"
                    : "border-t-4 border-t-destructive translate-y-0.5"
                )} />
                {trend.isPositive ? "+" : ""}{trend.value}%
              </p>
            )}
          </div>
          <div className="p-2 sm:p-3 bg-primary/10 rounded-full flex-shrink-0 transition-all duration-300 group-hover:bg-primary/20">
            <div className="text-primary w-4 h-4 sm:w-6 sm:h-6">
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
