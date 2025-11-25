import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  testId?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = 'default',
  testId,
}: MetricCardProps) {
  const variantColors = {
    default: 'text-primary-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    error: 'text-error-600',
  };

  // Generate testId from title if not provided
  const cardTestId = testId || `metric-card-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <Card data-testid={cardTestId} className="hover-lift">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-text-secondary" data-testid="metric-card-title">
              {title}
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <h3
                className={`text-2xl font-bold ${variantColors[variant]}`}
                data-testid="metric-card-value"
              >
                {value.toLocaleString()}
              </h3>
              {trend && (
                <Badge
                  variant={trend.isPositive ? 'success' : 'error'}
                  size="sm"
                  data-testid="metric-card-trend"
                >
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </Badge>
              )}
            </div>
            {subtitle && (
              <p
                className="mt-0.5 text-xs text-text-tertiary truncate"
                data-testid="metric-card-subtitle"
              >
                {subtitle}
              </p>
            )}
          </div>
          {icon && (
            <div className={`text-2xl ${variantColors[variant]} opacity-40 flex-shrink-0`}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
