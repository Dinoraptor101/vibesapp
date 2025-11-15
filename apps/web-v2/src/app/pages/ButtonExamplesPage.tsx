/**
 * Button Component Examples Page
 *
 * Comprehensive showcase of all Button component variants, sizes, states, and features.
 * Used for testing and documentation purposes.
 */

import {
  ChevronRight,
  Download,
  Heart,
  Plus,
  Save,
  Search,
  Send,
  Settings,
  Trash2,
  Upload,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui-next/Button';

export function ButtonExamplesPage() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const toggleLoading = (key: string) => {
    setLoadingStates((prev) => ({ ...prev, [key]: !prev[key] }));
    // Auto-reset after 2 seconds for demo
    setTimeout(() => {
      setLoadingStates((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-light-bg-base dim:bg-dim-bg-base dark:bg-dark-bg-base p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary">
            Button Component
          </h1>
          <p className="text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary text-lg">
            All variants, sizes, states, and features
          </p>
        </div>

        {/* Variants Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary border-b border-light-border dim:border-dim-border dark:border-dark-border pb-2">
            Variants
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
          </div>
        </section>

        {/* Sizes Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary border-b border-light-border dim:border-dim-border dark:border-dark-border pb-2">
            Sizes
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="sm">Small Button</Button>
            <Button size="md">Medium Button</Button>
            <Button size="lg">Large Button</Button>
          </div>
        </section>

        {/* States Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary border-b border-light-border dim:border-dim-border dark:border-dark-border pb-2">
            States
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary">
                Default
              </h3>
              <div className="flex flex-wrap gap-4">
                <Button>Normal State</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary">
                Disabled
              </h3>
              <div className="flex flex-wrap gap-4">
                <Button disabled>Disabled Primary</Button>
                <Button variant="secondary" disabled>
                  Disabled Secondary
                </Button>
                <Button variant="ghost" disabled>
                  Disabled Ghost
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary">
                Loading
              </h3>
              <div className="flex flex-wrap gap-4">
                <Button loading={loadingStates.primary1} onClick={() => toggleLoading('primary1')}>
                  Click to Load
                </Button>
                <Button
                  variant="secondary"
                  loading={loadingStates.secondary1}
                  onClick={() => toggleLoading('secondary1')}
                >
                  Loading Secondary
                </Button>
                <Button
                  variant="destructive"
                  loading={loadingStates.destructive1}
                  onClick={() => toggleLoading('destructive1')}
                >
                  Deleting...
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Icons Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary border-b border-light-border dim:border-dim-border dark:border-dark-border pb-2">
            With Icons
          </h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary">
                Left Icon
              </h3>
              <div className="flex flex-wrap gap-4">
                <Button leftIcon={<Plus />}>Create New</Button>
                <Button variant="secondary" leftIcon={<Search />}>
                  Search
                </Button>
                <Button variant="ghost" leftIcon={<Settings />}>
                  Settings
                </Button>
                <Button variant="destructive" leftIcon={<Trash2 />}>
                  Delete
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary">
                Right Icon
              </h3>
              <div className="flex flex-wrap gap-4">
                <Button rightIcon={<ChevronRight />}>Continue</Button>
                <Button variant="secondary" rightIcon={<Download />}>
                  Download
                </Button>
                <Button variant="outline" rightIcon={<Send />}>
                  Send Message
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary">
                Both Icons
              </h3>
              <div className="flex flex-wrap gap-4">
                <Button leftIcon={<Upload />} rightIcon={<ChevronRight />}>
                  Upload and Continue
                </Button>
                <Button variant="secondary" leftIcon={<Save />} rightIcon={<ChevronRight />}>
                  Save and Next
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Loading with Icons Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary border-b border-light-border dim:border-dim-border dark:border-dark-border pb-2">
            Loading States with Icons
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button
              leftIcon={<Save />}
              loading={loadingStates.save}
              onClick={() => toggleLoading('save')}
            >
              Save Changes
            </Button>
            <Button
              leftIcon={<Upload />}
              rightIcon={<ChevronRight />}
              loading={loadingStates.upload}
              onClick={() => toggleLoading('upload')}
            >
              Upload File
            </Button>
            <Button
              variant="secondary"
              leftIcon={<Heart />}
              loading={loadingStates.heart}
              onClick={() => toggleLoading('heart')}
            >
              Like Post
            </Button>
          </div>
        </section>

        {/* Size Variations with Icons */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary border-b border-light-border dim:border-dim-border dark:border-dark-border pb-2">
            Icon Sizes
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="sm" leftIcon={<Plus />}>
              Small with Icon
            </Button>
            <Button size="md" leftIcon={<Plus />}>
              Medium with Icon
            </Button>
            <Button size="lg" leftIcon={<Plus />}>
              Large with Icon
            </Button>
          </div>
        </section>

        {/* Full Width Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary border-b border-light-border dim:border-dim-border dark:border-dark-border pb-2">
            Full Width
          </h2>
          <div className="space-y-4">
            <Button fullWidth>Full Width Primary</Button>
            <Button variant="secondary" fullWidth>
              Full Width Secondary
            </Button>
            <Button variant="outline" fullWidth leftIcon={<Plus />}>
              Full Width with Icon
            </Button>
            <Button
              variant="destructive"
              fullWidth
              leftIcon={<Trash2 />}
              loading={loadingStates.fullWidth}
              onClick={() => toggleLoading('fullWidth')}
            >
              Delete Account
            </Button>
          </div>
        </section>

        {/* Real World Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary border-b border-light-border dim:border-dim-border dark:border-dark-border pb-2">
            Real World Examples
          </h2>

          <div className="space-y-8">
            {/* Form Actions */}
            <div className="p-6 bg-light-bg-elevated dim:bg-dim-bg-elevated dark:bg-dark-bg-elevated rounded-lg space-y-4">
              <h3 className="text-lg font-semibold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary">
                Form Actions
              </h3>
              <div className="flex gap-4">
                <Button variant="ghost">Cancel</Button>
                <Button
                  leftIcon={<Save />}
                  loading={loadingStates.formSave}
                  onClick={() => toggleLoading('formSave')}
                >
                  Save Changes
                </Button>
              </div>
            </div>

            {/* Card Actions */}
            <div className="p-6 bg-light-bg-elevated dim:bg-dim-bg-elevated dark:bg-dark-bg-elevated rounded-lg space-y-4">
              <h3 className="text-lg font-semibold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary">
                Card Actions
              </h3>
              <p className="text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary">
                This is a sample card with action buttons
              </p>
              <div className="flex gap-3">
                <Button size="sm" variant="secondary" leftIcon={<Heart />}>
                  Like
                </Button>
                <Button size="sm" variant="secondary" leftIcon={<Send />}>
                  Share
                </Button>
                <Button size="sm" variant="ghost" leftIcon={<Settings />}>
                  Options
                </Button>
              </div>
            </div>

            {/* Destructive Action */}
            <div className="p-6 bg-light-bg-elevated dim:bg-dim-bg-elevated dark:bg-dark-bg-elevated rounded-lg space-y-4">
              <h3 className="text-lg font-semibold text-light-text-primary dim:text-dim-text-primary dark:text-dark-text-primary">
                Destructive Actions
              </h3>
              <p className="text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary">
                Are you sure you want to delete this item?
              </p>
              <div className="flex gap-4">
                <Button variant="ghost">Cancel</Button>
                <Button
                  variant="destructive"
                  leftIcon={<Trash2 />}
                  loading={loadingStates.delete}
                  onClick={() => toggleLoading('delete')}
                >
                  Delete Forever
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Note */}
        <div className="text-center text-sm text-light-text-secondary dim:text-dim-text-secondary dark:text-dark-text-secondary border-t border-light-border dim:border-dim-border dark:border-dark-border pt-8">
          <p>
            Toggle dark mode to see how buttons adapt to different themes. All buttons include
            proper ARIA attributes and keyboard navigation support.
          </p>
        </div>
      </div>
    </div>
  );
}
