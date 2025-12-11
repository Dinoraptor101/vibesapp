import { FeedbackForm } from '../components/FeedbackForm';
import { FeedbackList } from '../components/FeedbackList';

export function FeedbackPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100 dim:text-gray-100">
        Feedback & Support
      </h1>
      <p className="text-gray-600 dark:text-gray-400 dim:text-gray-400 mb-6">
        Is your concern already reported? Check existing submissions below.
      </p>

      <FeedbackList />

      {/* Divider */}
      <div className="border-t border-gray-200 dim:border-gray-600 dark:border-gray-700 my-8" />

      <div>
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100 dim:text-gray-100">
          Don't see anything similar?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 dim:text-gray-400 mb-4">
          Submit a new bug report or feature request below.
        </p>
        <FeedbackForm onSuccess={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
      </div>
    </div>
  );
}
