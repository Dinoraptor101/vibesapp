import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';

interface ActivityDataPoint {
  date: string;
  posts: number;
  reports: number;
  autoHidden: number;
}

interface ActivityChartProps {
  data: ActivityDataPoint[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card data-testid="admin-activity-chart">
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Activity (Last 7 Days)</h3>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">No data available</p>
        </CardContent>
      </Card>
    );
  }

  // Find max value for scaling
  const maxValue = Math.max(...data.map((d) => Math.max(d.posts, d.reports, d.autoHidden)), 1);

  // Format date to short format (e.g., "Mon", "Tue")
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <Card data-testid="admin-activity-chart">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-text-primary">Activity (Last 7 Days)</h3>
          <div className="flex gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-primary-500" />
              <span className="text-text-secondary">Posts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-warning-500" />
              <span className="text-text-secondary">Reports</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-error-500" />
              <span className="text-text-secondary">Auto-hidden</span>
            </div>
          </div>
        </div>
        <div className="relative h-44">
          {/* Simple bar chart */}
          <div className="flex h-full items-end justify-around gap-2">
            {data.map((point) => {
              const postsHeight = (point.posts / maxValue) * 100;
              const reportsHeight = (point.reports / maxValue) * 100;
              const autoHiddenHeight = (point.autoHidden / maxValue) * 100;

              return (
                <div key={point.date} className="flex flex-1 flex-col items-center gap-2">
                  {/* Bars container */}
                  <div className="flex h-full w-full items-end justify-center gap-1">
                    {/* Posts bar */}
                    <div
                      className="w-1/3 rounded-t bg-primary-500 transition-all hover:opacity-80"
                      style={{ height: `${postsHeight}%` }}
                      title={`Posts: ${point.posts}`}
                    />
                    {/* Reports bar */}
                    <div
                      className="w-1/3 rounded-t bg-warning-500 transition-all hover:opacity-80"
                      style={{ height: `${reportsHeight}%` }}
                      title={`Reports: ${point.reports}`}
                    />
                    {/* Auto-hidden bar */}
                    <div
                      className="w-1/3 rounded-t bg-error-500 transition-all hover:opacity-80"
                      style={{ height: `${autoHiddenHeight}%` }}
                      title={`Auto-hidden: ${point.autoHidden}`}
                    />
                  </div>

                  {/* Date label */}
                  <span className="text-xs text-gray-600">{formatDate(point.date)}</span>

                  {/* Values on hover */}
                  <div className="text-center text-xs text-gray-500">
                    <div>{point.posts}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary stats - Compact */}
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-3">
          <div className="text-center">
            <p className="text-xs text-text-secondary">Total Posts</p>
            <Badge variant="default" size="sm" className="mt-1">
              {data.reduce((sum, d) => sum + d.posts, 0)}
            </Badge>
          </div>
          <div className="text-center">
            <p className="text-xs text-text-secondary">Total Reports</p>
            <Badge variant="warning" size="sm" className="mt-1">
              {data.reduce((sum, d) => sum + d.reports, 0)}
            </Badge>
          </div>
          <div className="text-center">
            <p className="text-xs text-text-secondary">Auto-hidden</p>
            <Badge variant="error" size="sm" className="mt-1">
              {data.reduce((sum, d) => sum + d.autoHidden, 0)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
