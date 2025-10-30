import imageCompression from 'browser-image-compression';
import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import './Issue.css';
import posthog from 'posthog-js';
import type { IssueProps } from '../../types';
import { getImageUrl, getPresignedUrl, logDebug } from '../../utils/utils';

interface FormElements extends HTMLFormControlsCollection {
  title: HTMLInputElement;
  email: HTMLInputElement;
  bugDetails: HTMLTextAreaElement;
}

interface IssueFormElement extends HTMLFormElement {
  elements: FormElements;
}

/**
 * A form for submitting bug reports and issues.
 * Supports file uploads, form validation, and submission to the API.
 * Includes image compression and custom error handling.
 * @param {IssueProps} props - The issue form properties
 * @param {Function} props.setNotification - Callback to display notification messages
 * @returns {React.ReactElement} An issue report form element
 */
const Issue: React.FC<IssueProps> = ({ setNotification }) => {
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<IssueFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const form = event.currentTarget.elements;
    const title = `BUG REPORT: ${form.title.value.trim()}`;
    const email = form.email.value.trim();
    const bugDetails = form.bugDetails.value.trim();

    if (!title || !email || !bugDetails) {
      setNotification({
        message: 'Please fill all the fields',
        type: 'error',
      });
      logDebug('All fields are required for bug report');
      setIsSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setNotification({
        message: 'I promise not to sell this! Needd this if I have questions.',
        type: 'error',
      });
      logDebug('Invalid email address');
      setIsSubmitting(false);
      return;
    }

    let screenshotUrl: string | null = null;
    if (screenshot) {
      try {
        const compressedImage = await imageCompression(screenshot, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });

        const {
          data: { url, key },
        } = await apiService.get(getPresignedUrl);

        // Set headers globally for the axios instance
        apiService.getClient().defaults.headers['Content-Type'] = compressedImage.type;

        await apiService.put(url, compressedImage);

        // Remove the custom header after the request
        delete apiService.getClient().defaults.headers['Content-Type'];

        screenshotUrl = getImageUrl(key, 'full');
        logDebug('Screenshot uploaded successfully');
      } catch (_error) {
        setNotification({
          message: 'Failed to report! reported to the foxes.',
          type: 'error',
        });
        logDebug('Error uploading screenshot');
        setIsSubmitting(false);
        posthog.capture('Bug Report Failed', {
          title,
          email,
          screenshotUrl,
        });

        return;
      }
    }

    const body = `
        Email: ${email}

        Bug Details:
        ${bugDetails}

        ${screenshotUrl ? `Screenshot: [View Image](${screenshotUrl})` : ''}
        `;

    const data = {
      title,
      body,
    };

    try {
      const response = await apiService.post('/api/issues', data);
      if (response.status === 200) {
        logDebug('Bug report submitted successfully');
        setNotification({
          message: 'Reported!',
          type: 'success',
        });
        posthog.capture('Bug Report Submitted', {
          title,
          email,
          screenshotUrl,
        });
        navigate(-1);
      } else {
        setNotification({
          message: 'Failed to report, foxes are on it.',
          type: 'error',
        });
        logDebug('Error submitting bug report');
      }
    } catch (error) {
      setNotification({
        message: 'Pigeon failed to report, maybe clear cache.',
        type: 'error',
      });
      logDebug('Error submitting bug report');
      posthog.capture('Bug Report Failed', {
        title,
        email,
        screenshot,
        error,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="form-container">
      <div className="form-header">
        <h1 className="form-title">Report an Issue</h1>
      </div>

      <form className="issue-form" onSubmit={handleSubmit} aria-label="Issue report form">
        <div className="form-field">
          <label htmlFor="title" className="form-label">
            Impacted feature{' '}
            <span className="required-mark" aria-hidden="true">
              *
            </span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="form-input"
            placeholder="e.g., Login, Search, Navigation"
            aria-required="true"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-field">
          <label htmlFor="bugDetails" className="form-label">
            Details
          </label>
          <textarea
            id="bugDetails"
            name="bugDetails"
            required
            className="form-textarea"
            placeholder="1. Steps to reproduce
2. Expected behavior
3. Actual behavior"
            disabled={isSubmitting}
          ></textarea>
        </div>

        <div className="form-field">
          <label htmlFor="screenshot" className="form-label">
            Screenshot <span className="optional-text">(optional)</span>
          </label>
          <input
            type="file"
            id="screenshot"
            name="screenshot"
            accept="image/*"
            onChange={(e) => setScreenshot(e.target.files ? e.target.files[0] : null)}
            className="form-input"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-field">
          <label htmlFor="email" className="form-label">
            Your Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="form-input"
            placeholder="email@example.com"
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          className={`form-submit ${isSubmitting ? 'submitting' : ''}`}
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </main>
  );
};

export default Issue;
