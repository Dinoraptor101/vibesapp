/**
 * Admin Dashboard Page
 * Overview of admin metrics and urgent actions
 */

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { ActivityChart } from '../components/ActivityChart';
import { AdminLayout } from '../components/AdminLayout';
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
          data: { success: boolean; metrics: DashboardMetrics };
        }>,
        api.get('/admin/activity') as Promise<{
          data: { success: boolean; activityData: ActivityDataPoint[] };
        }>,
      ]);

      setMetrics(metricsResponse.data.metrics);
      setActivityData(activityResponse.data.activityData);
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
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Overview of VibesApp metrics and activity</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
            <p className="mt-4 text-gray-500">Loading dashboard...</p>
          </div>
        )}

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
            {/* Overview Metrics */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Active Users"
                value={metrics.activeUsers.thisWeek}
                subtitle={`${metrics.activeUsers.total} total users`}
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
                title="Auto-Hidden Posts"
                value={metrics.autoHidden.total}
                subtitle={`${metrics.autoHidden.lastHour} in last hour`}
                variant="error"
                icon="🚫"
              />
            </div>

            {/* Urgent Actions */}
            {(metrics.urgent.autoHiddenLastHour > 0 || metrics.urgent.unreviewedFlagged > 0) && (
              <Card className="border-warning-200 bg-warning-50">
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900">
                    🚨 Urgent Actions Required
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.urgent.autoHiddenLastHour > 0 && (
                      <div className="flex items-center justify-between rounded-lg border border-warning-200 bg-white p-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {metrics.urgent.autoHiddenLastHour} posts auto-hidden in the last hour
                          </p>
                          <p className="text-sm text-gray-600">
                            Posts exceeded the dislike threshold and were automatically hidden
                          </p>
                        </div>
                        <Link to="/admin/flagged">
                          <Button variant="destructive" size="sm">
                            Review Now
                          </Button>
                        </Link>
                      </div>
                    )}

                    {metrics.urgent.unreviewedFlagged > 0 && (
                      <div className="flex items-center justify-between rounded-lg border border-warning-200 bg-white p-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {metrics.urgent.unreviewedFlagged} flagged posts awaiting review
                          </p>
                          <p className="text-sm text-gray-600">
                            Posts with dislikes that haven't been reviewed yet
                          </p>
                        </div>
                        <Link to="/admin/flagged">
                          <Button variant="destructive" size="sm">
                            Review Now
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity Chart */}
            <ActivityChart data={activityData} />

            {/* Quick Links */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Link to="/admin/flagged">
                <Card className="cursor-pointer transition-all hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Flagged Posts</h3>
                        <p className="mt-1 text-sm text-gray-600">
                          Review and moderate flagged content
                        </p>
                      </div>
                      <Badge variant="warning" size="md">
                        {metrics.reports.today}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/admin/users">
                <Card className="cursor-pointer transition-all hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                        <p className="mt-1 text-sm text-gray-600">Manage users and permissions</p>
                      </div>
                      <Badge variant="default" size="md">
                        {metrics.activeUsers.total}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/admin/settings">
                <Card className="cursor-pointer transition-all hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
                        <p className="mt-1 text-sm text-gray-600">Configure admin preferences</p>
                      </div>
                      <span className="text-2xl">⚙️</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
