import { useState } from 'react';
import { FeedbackForm } from '../components/FeedbackForm';
import { FeedbackList } from '../components/FeedbackList';

export function FeedbackPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 dim:text-gray-100">
        Feedback & Support
      </h1>

      {!showForm ? (
        <>
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 mb-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            data-testid="show-feedback-form-button"
          >
            Submit Feedback
          </button>

          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 dim:text-gray-100">
            All Submissions
          </h2>
          <FeedbackList />
        </>
      ) : (
        <>
          <button
            onClick={() => setShowForm(false)}
            className="mb-4 text-blue-500 hover:text-blue-600"
            data-testid="back-to-feedback-list-button"
          >
            ← Back to list
          </button>
          <FeedbackForm onSuccess={() => setShowForm(false)} />
        </>
      )}
    </div>
  );
}
