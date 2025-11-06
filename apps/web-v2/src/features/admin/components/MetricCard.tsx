import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';

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
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = 'default',
}: MetricCardProps) {
  const variantColors = {
    default: 'text-primary-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    error: 'text-error-600',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className={`text-3xl font-bold ${variantColors[variant]}`}>
                {value.toLocaleString()}
              </h3>
              {trend && (
                <Badge variant={trend.isPositive ? 'success' : 'error'} size="sm">
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </Badge>
              )}
            </div>
            {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
          </div>
          {icon && <div className={`text-3xl ${variantColors[variant]} opacity-50`}>{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
