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
    <Card data-testid={cardTestId}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500" data-testid="metric-card-title">
              {title}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <h3
                className={`text-3xl font-bold ${variantColors[variant]}`}
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
              <p className="mt-1 text-sm text-gray-600" data-testid="metric-card-subtitle">
                {subtitle}
              </p>
            )}
          </div>
          {icon && <div className={`text-3xl ${variantColors[variant]} opacity-50`}>{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
