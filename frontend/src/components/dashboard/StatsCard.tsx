import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  variant?: 'default' | 'primary' | 'accent' | 'success';
}

const variantStyles = {
  default: 'bg-card',
  primary: 'gradient-primary text-primary-foreground',
  accent: 'gradient-accent text-accent-foreground',
  success: 'bg-success text-success-foreground',
};

export function StatsCard({ title, value, icon, trend, className, variant = 'default' }: StatsCardProps) {
  const isColoredVariant = variant !== 'default';

  return (
    <div
      className={cn(
        'rounded-xl p-5 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 animate-scale-in',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn('text-sm font-medium', isColoredVariant ? 'opacity-90' : 'text-muted-foreground')}>
            {title}
          </p>
          <p className="text-3xl font-display font-bold tracking-tight">{value}</p>
          {trend && (
            <div className="flex items-center gap-1">
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <span
                className={cn(
                  'text-xs font-medium',
                  isColoredVariant
                    ? 'opacity-90'
                    : trend.isPositive
                    ? 'text-success'
                    : 'text-destructive'
                )}
              >
                {trend.value}% from last month
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'p-3 rounded-xl',
            isColoredVariant ? 'bg-white/20' : 'bg-primary/10'
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
