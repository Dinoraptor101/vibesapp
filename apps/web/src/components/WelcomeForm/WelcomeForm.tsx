/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */

import { faCopy, faDove, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { type ChangeEvent, type FormEvent, type JSX, useCallback } from 'react';
import { useWelcomeForm } from '../../hooks/useWelcomeForm';
import type { WelcomeFormProps } from '../../types';
import type { SexType } from '../../types/enums';
import type { INotification } from '../../types/notification';
import { createMemoizedComponent } from '../../utils/componentUtils';
import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary';
import CustomSelector from './CustomSelector/CustomSelector';
import { getRandomWelcomeMessage } from './welcomeMessages';
import './WelcomeForm.css';

/**
 * Memoized pigeon tag display component
 */
const PigeonTagDisplay = React.memo<{
  pigeonId: string;
  onCopy: (value: string) => void;
  onLogin: () => void;
}>(({ pigeonId, onCopy, onLogin }) => (
  <div className="tag-menu">
    <span>Save your pigeon&apos;s tag:</span>
    <div className="pigeon-id">
      <span>
        <strong>{pigeonId}</strong>
      </span>
      <button
        type="button"
        onClick={() => onCopy(pigeonId)}
        className="copy-icon"
        data-testid="copy-button"
        aria-label="Copy pigeon ID"
      >
        <FontAwesomeIcon icon={faCopy} />
      </button>
    </div>
    <p>This acts as your password across devices.</p>
    <button type="button" onClick={onLogin} className="login-button" data-testid="login-button">
      <FontAwesomeIcon icon={faSignInAlt} />
      &nbsp;Login
    </button>
  </div>
));

PigeonTagDisplay.displayName = 'PigeonTagDisplay';

/**
 * Memoized registration form component with clean layout (no inline errors)
 */
interface FormState {
  userName: string;
  birthYear: string;
  birthMonth: string;
  sex: string;
  loading?: boolean;
}

interface ValidationState {
  errors: Record<string, string>;
  isValid: boolean;
}

interface FormOptions {
  birthMonthOptions: Array<{ value: string; label: string }>;
  sexOptions: Array<{ value: string; label: string }>;
}

const RegistrationForm = React.memo<{
  formState: FormState;
  validation: ValidationState;
  options: FormOptions;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onFieldChange: (field: string, value: string) => void;
  onFieldBlur: (field: string) => void;
  touchedFields: Record<string, boolean>;
}>(({ formState, validation, options, onSubmit, onFieldChange, onFieldBlur, touchedFields }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => ({
    value: (currentYear - i).toString(),
    label: (currentYear - i).toString(),
  }));

  return (
    <form className="new-user-form" onSubmit={onSubmit}>
      <label htmlFor="userName">What&apos;s your name?</label>
      <input
        id="userName"
        name="userName"
        type="text"
        value={formState.userName}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onFieldChange('userName', e.target.value)}
        onBlur={() => onFieldBlur('userName')}
        required
        placeholder="Name"
        data-testid="username-input"
        aria-invalid={!!(touchedFields.userName && validation.errors.userName)}
      />

      <label htmlFor="specs">What are your specs?</label>
      <div className="specs-container">
        <CustomSelector
          id="birthYear"
          value={formState.birthYear}
          options={years}
          onChange={(value) => {
            onFieldChange('birthYear', value);
            onFieldBlur('birthYear');
          }}
          placeholder="Birth Year"
          required
        />

        <CustomSelector
          id="birthMonth"
          value={formState.birthMonth}
          options={options.birthMonthOptions}
          onChange={(value) => {
            onFieldChange('birthMonth', value);
            onFieldBlur('birthMonth');
          }}
          placeholder="Birth Month"
          required
        />

        <CustomSelector
          id="sex"
          value={formState.sex}
          options={options.sexOptions}
          onChange={(value) => onFieldChange('sex', value)}
          placeholder="Sex"
          required
        />
      </div>

      <button
        type="submit"
        disabled={formState.loading}
        data-testid="register-button"
        className="submit-button"
      >
        {formState.loading ? (
          'Loading...'
        ) : (
          <>
            <FontAwesomeIcon icon={faDove} />
            &nbsp;Get my pigeon&apos;s tag
          </>
        )}
      </button>
    </form>
  );
});

RegistrationForm.displayName = 'RegistrationForm';

/**
 * Memoized login form component
 */
const LoginForm = React.memo<{
  onLogin: (pigeonId: string) => void;
  existingPigeonId: string;
  onFieldChange: (field: string, value: string) => void;
  loading: boolean;
  setNotification?: (notification: INotification) => void;
}>(({ onLogin, existingPigeonId, onFieldChange, loading, setNotification }) => {
  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!existingPigeonId.trim()) {
        if (setNotification) {
          const notification: INotification = {
            message: 'Please enter your pigeon tag',
            type: 'error',
          };
          setNotification(notification);
        }
        return;
      }
      onLogin(existingPigeonId.trim());
    },
    [onLogin, existingPigeonId, setNotification]
  );

  return (
    <>
      <hr />
      <form className="existing-user-form" onSubmit={handleSubmit}>
        <label htmlFor="existingPigeonId">Already have a pigeon tag?</label>
        <input
          id="existingPigeonId"
          name="existingPigeonId"
          type="text"
          value={existingPigeonId}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onFieldChange('existingPigeonId', e.target.value)
          }
          placeholder="Enter your pigeon tag"
          data-testid="pigeon-id-input"
        />
        <button
          type="submit"
          disabled={loading}
          data-testid="login-existing-button"
          className="submit-button"
        >
          {loading ? (
            'Loading...'
          ) : (
            <>
              <FontAwesomeIcon icon={faSignInAlt} />
              &nbsp;Login
            </>
          )}
        </button>
      </form>
    </>
  );
});

LoginForm.displayName = 'LoginForm';

/**
 * WelcomeForm component with validation errors shown only on submission attempt
 */
const WelcomeForm: React.FC<WelcomeFormProps> = ({ setNotification }) => {
  const { formState, handlers, validation, options } = useWelcomeForm(setNotification);

  // Static welcome message to prevent re-renders
  const [welcomeMessage] = React.useState<JSX.Element>(() => getRandomWelcomeMessage());

  // Track which fields have been touched (blurred)
  const [touchedFields, setTouchedFields] = React.useState<Record<string, boolean>>({});

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Check if form is valid before proceeding
      if (!validation.isValid) {
        // Find the first error to display via notification
        const firstErrorKey = Object.keys(validation.errors)[0];
        const firstError = validation.errors[firstErrorKey];

        if (firstError && setNotification) {
          const notification: INotification = {
            message: firstError,
            type: 'error',
          };
          setNotification(notification);
        }
        return;
      }

      handlers.handleRegistration({
        userName: formState.userName,
        birthYear: formState.birthYear,
        birthMonth: formState.birthMonth,
        sex: formState.sex as SexType,
      });
    },
    [formState, handlers, validation.isValid, validation.errors, setNotification]
  );

  const handleCopy = useCallback(
    (pigeonId: string) => {
      handlers.handleCopy(pigeonId);
    },
    [handlers]
  );

  const handleTagLogin = useCallback(() => {
    if (formState.newlyRegisteredPigeonId && formState.newlyRegisteredUserId) {
      handlers.handleLoginWithTag(
        formState.newlyRegisteredPigeonId,
        formState.newlyRegisteredUserId
      );
    }
  }, [formState.newlyRegisteredPigeonId, formState.newlyRegisteredUserId, handlers]);

  // Wrapper functions for field changes
  const handleFieldChange = useCallback(
    (field: string, value: string) => {
      handlers.updateField(field as keyof typeof formState, value);
    },
    [handlers]
  );

  // Handle field blur (when user leaves a field) - just track touched state
  const handleFieldBlur = useCallback((field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  }, []);

  // Conditional rendering optimization
  if (formState.newlyRegisteredPigeonId && formState.showTagMenu) {
    return (
      <div className="user-info-card">
        <div className="welcome-message">{welcomeMessage}</div>
        <hr />
        <PigeonTagDisplay
          pigeonId={formState.newlyRegisteredPigeonId}
          onCopy={handleCopy}
          onLogin={handleTagLogin}
        />
      </div>
    );
  }

  return (
    <div className="user-info-card">
      <div className="welcome-message">{welcomeMessage}</div>
      <hr />

      <RegistrationForm
        formState={formState}
        validation={validation}
        options={options}
        onSubmit={handleSubmit}
        onFieldChange={handleFieldChange}
        onFieldBlur={handleFieldBlur}
        touchedFields={touchedFields}
      />

      <LoginForm
        onLogin={handlers.handleLogin}
        existingPigeonId={formState.existingPigeonId}
        onFieldChange={handleFieldChange}
        loading={formState.loading}
        setNotification={setNotification}
      />
    </div>
  );
};

// Export with error boundary and memoization
const MemoizedWelcomeForm = createMemoizedComponent(WelcomeForm);

const WelcomeFormWithErrorBoundary = (props: WelcomeFormProps) => (
  <ErrorBoundary>
    <MemoizedWelcomeForm {...props} />
  </ErrorBoundary>
);

WelcomeFormWithErrorBoundary.displayName = 'WelcomeFormWithErrorBoundary';

export default WelcomeFormWithErrorBoundary;
