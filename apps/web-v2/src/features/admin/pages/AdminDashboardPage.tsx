/**
 * Admin Dashboard Page
 * Overview of admin metrics and urgent actions
 */

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { ActivityChart } from '../components/ActivityChart';
import { MetricCard } from '../components/MetricCard';

interface DashboardMetrics {
  activeUsers: {
    today: number;
    thisWeek: number;
    total: number;
  };
  posts: {
    today: number;
    thisWeek: number;
    change: number;
  };
  reports: {
    today: number;
    thisWeek: number;
    change: number;
  };
  autoHidden: {
    total: number;
    lastHour: number;
  };
  urgent: {
    autoHiddenLastHour: number;
    unreviewedFlagged: number;
  };
}

interface ActivityDataPoint {
  date: string;
  posts: number;
  reports: number;
  autoHidden: number;
}

// Skeleton component for loading state
function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Metric cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-surface-2 rounded-lg" />
        ))}
      </div>
      {/* Activity chart skeleton */}
      <div className="h-52 bg-surface-2 rounded-lg" />
    </div>
  );
}

export function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [activityData, setActivityData] = useState<ActivityDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [metricsResponse, activityResponse] = await Promise.all([
        api.get('/admin/metrics') as Promise<{
          success: boolean;
          metrics: DashboardMetrics;
        }>,
        api.get('/admin/activity') as Promise<{
          success: boolean;
          activityData: ActivityDataPoint[];
        }>,
      ]);

      setMetrics(metricsResponse.metrics);
      setActivityData(activityResponse.activityData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="space-y-4">
      {/* Header - Compact */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary" data-testid="admin-dashboard-title">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Overview of VibesApp metrics and activity
        </p>
      </div>

      {/* Loading State - Skeleton */}
      {isLoading && <DashboardSkeleton />}

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-error-200 bg-error-50 p-6 text-center">
          <p className="text-error-600">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchDashboardData} className="mt-4">
            Retry
          </Button>
        </div>
      )}

      {/* Dashboard Content */}
      {!isLoading && !error && metrics && (
        <>
          {/* Urgent Actions - Compact */}
          {(metrics.urgent.autoHiddenLastHour > 0 || metrics.urgent.unreviewedFlagged > 0) && (
            <Card className="border-warning-200 bg-warning-50">
              <CardContent className="p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl flex-shrink-0">🚨</span>
                    <div className="flex items-center gap-4">
                      {metrics.urgent.autoHiddenLastHour > 0 && (
                        <div>
                          <span className="text-sm font-medium text-text-primary">
                            {metrics.urgent.autoHiddenLastHour} posts auto-hidden
                          </span>
                          <p className="text-xs text-text-secondary">Exceeded dislike threshold</p>
                        </div>
                      )}
                      {metrics.urgent.unreviewedFlagged > 0 && (
                        <div>
                          <span className="text-sm font-medium text-text-primary">
                            {metrics.urgent.unreviewedFlagged} flagged posts pending
                          </span>
                          <p className="text-xs text-text-secondary">
                            Posts with reports pending review
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Link to="/admin/flagged">
                    <Button variant="destructive" size="sm">
                      Review
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Overview Metrics - Single Row */}
          <div className="grid grid-cols-4 gap-4" data-testid="admin-metrics-container">
            <MetricCard
              title="Active Users"
              value={metrics.activeUsers.thisWeek}
              subtitle={`${metrics.activeUsers.total} total`}
              variant="success"
              icon="👥"
            />
            <MetricCard
              title="Posts Today"
              value={metrics.posts.today}
              subtitle={`${metrics.posts.thisWeek} this week`}
              trend={{
                value: metrics.posts.change,
                isPositive: metrics.posts.change >= 0,
              }}
              variant="default"
              icon="📸"
            />
            <MetricCard
              title="Reports Today"
              value={metrics.reports.today}
              subtitle={`${metrics.reports.thisWeek} this week`}
              trend={{
                value: metrics.reports.change,
                isPositive: metrics.reports.change <= 0,
              }}
              variant="warning"
              icon="⚠️"
            />
            <MetricCard
              title="Auto-Hidden"
              value={metrics.autoHidden.total}
              subtitle={`${metrics.autoHidden.lastHour} last hour`}
              variant="error"
              icon="🚫"
            />
          </div>

          {/* Activity Chart */}
          <ActivityChart data={activityData} />
        </>
      )}
    </div>
  );
}
