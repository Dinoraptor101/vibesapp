/**
 * Admin Dashboard Page
 * Overview of admin metrics and urgent actions
 */

import { AdminLayout } from '../components/AdminLayout';

export function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-6">Dashboard</h1>

        <div className="bg-surface-2 rounded-lg p-8 text-center">
          <p className="text-text-secondary mb-4">Admin dashboard coming in Phase 0.7</p>
          <p className="text-sm text-text-tertiary">
            This will show metrics, charts, and urgent actions
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
