import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendColor?: string;
  // One of a small set to avoid dynamic classes being purged
  borderColor?: 'green' | 'blue' | 'orange';
}

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendColor = 'text-green-600',
  borderColor
}: StatsCardProps) => {
  const borderClass =
    borderColor === 'green'
      ? 'border-green-200'
      : borderColor === 'blue'
      ? 'border-blue-200'
      : borderColor === 'orange'
      ? 'border-orange-200'
      : '';
  const iconColorClass =
    borderColor === 'green'
      ? 'text-green-600'
      : borderColor === 'blue'
      ? 'text-blue-600'
      : borderColor === 'orange'
      ? 'text-orange-600'
      : 'text-primary';
  return (
    <Card className={borderClass}>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p className={`text-xs ${trendColor}`}>{trend}</p>
            )}
          </div>
          <Icon className={`h-8 w-8 ${iconColorClass}`} />
        </div>
      </CardContent>
    </Card>
  );
};
