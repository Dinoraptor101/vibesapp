import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeedbackForm } from '../components/FeedbackForm';
import { FeedbackList } from '../components/FeedbackList';
import { listFeedback } from '../api/feedbackService';

export function FeedbackPage() {
  const navigate = useNavigate();
  const { isLoading } = useQuery({
    queryKey: ['feedback'],
    queryFn: listFeedback,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          onClick={() => navigate('/settings')}
          variant="ghost"
          size="sm"
          className="h-10 w-10 p-0 min-h-[44px] min-w-[44px]"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Back to settings</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 dim:text-gray-100">
            Feedback & Support
          </h1>
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 dim:text-gray-400 mb-6">
        Is your concern already reported? Check existing submissions below.
      </p>

      <FeedbackList />

      {/* Divider and Form - Only show after list loads */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
        >
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
        </motion.div>
      )}
    </div>
  );
}
