/**
 * ProfileStats Component
 * Displays post count
 */

interface ProfileStatsProps {
  postsCount: number;
}

export function ProfileStats({ postsCount }: ProfileStatsProps) {
  return (
    <div className="flex items-center justify-around gap-4 rounded-lg border border-gray-200 dim:border-gray-600 dark:border-gray-700 bg-white dim:bg-gray-700 dark:bg-gray-800 p-4">
      <StatItem label="Posts" count={postsCount} />
    </div>
  );
}

interface StatItemProps {
  label: string;
  count: number;
}

function StatItem({ label, count }: StatItemProps) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-bold text-gray-900 dim:text-gray-100 dark:text-white">
        {count}
      </span>
      <span className="text-sm text-gray-500 dim:text-gray-450 dark:text-gray-400">{label}</span>
    </div>
  );
}
