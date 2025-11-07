import type React from 'react';
import { useCallback, useMemo, useReducer } from 'react';
import WelcomeFormHandler from '../components/WelcomeForm/handleWelcomeForm';
import type { INotification } from '../types/notification';
import type { FormValidation, SelectOption, StateAction, WelcomeFormState } from '../types/ui';
import { SexType, type UserRegistrationData } from '../types/user';

// Welcome form state actions
type WelcomeFormAction = StateAction<WelcomeFormState> & {
  type: 'SET_FIELD' | 'RESET' | 'SET_LOADING' | 'SET_TAG_INFO';
};

const initialWelcomeFormState: WelcomeFormState = {
  birthYear: '',
  birthMonth: '',
  sex: '',
  loading: false,
  userName: '',
  existingPigeonId: '',
  newlyRegisteredPigeonId: null,
  newlyRegisteredUserId: null,
  showTagMenu: false,
};

const welcomeFormReducer = (
  state: WelcomeFormState,
  action: WelcomeFormAction
): WelcomeFormState => {
  switch (action.type) {
    case 'SET_FIELD':
      return action.field ? { ...state, [action.field]: action.value } : state;
    case 'SET_LOADING':
      return { ...state, loading: action.value as boolean };
    case 'SET_TAG_INFO':
      return {
        ...state,
        newlyRegisteredPigeonId: action.payload?.newlyRegisteredPigeonId || null,
        newlyRegisteredUserId: action.payload?.newlyRegisteredUserId || null,
        showTagMenu: action.payload?.showTagMenu || false,
      };
    case 'RESET':
      return initialWelcomeFormState;
    default:
      return state;
  }
};

interface UseWelcomeFormReturn {
  formState: WelcomeFormState;
  handlers: {
    updateField: <K extends keyof WelcomeFormState>(_field: K, _value: WelcomeFormState[K]) => void;
    handleRegistration: (_data: UserRegistrationData) => Promise<void>;
    handleLogin: (_pigeonId: string) => Promise<void>;
    handleCopy: (_pigeonId: string) => void;
    handleLoginWithTag: (_pigeonId: string, _userId: string) => void;
    setLoading: (_loading: boolean) => void;
    reset: () => void;
  };
  validation: FormValidation;
  options: {
    birthMonthOptions: SelectOption[];
    sexOptions: SelectOption[];
  };
}

/**
 * Validation functions
 */
const validateUserName = (userName: string): boolean => {
  return userName.length >= 3 && userName.length <= 20;
};

const validateBirthYear = (birthYear: string): boolean => {
  const year = parseInt(birthYear, 10);
  const currentYear = new Date().getFullYear();
  return year >= currentYear - 100 && year <= currentYear - 13;
};

const validateBirthMonth = (birthMonth: string): boolean => {
  const month = parseInt(birthMonth, 10);
  return month >= 1 && month <= 12;
};

/**
 * Optimized WelcomeForm hook with proper state management and validation
 */
export const useWelcomeForm = (
  setNotification: (_notification: INotification) => void
): UseWelcomeFormReturn => {
  const [formState, dispatch] = useReducer(welcomeFormReducer, initialWelcomeFormState);

  // Initialize the handler with all required callbacks
  const handler = useMemo(
    () =>
      WelcomeFormHandler.getInstance(
        setNotification,
        (loading) => dispatch({ type: 'SET_LOADING', value: loading }),
        (pigeonId) =>
          dispatch({ type: 'SET_FIELD', field: 'newlyRegisteredPigeonId', value: pigeonId }),
        (userId) => dispatch({ type: 'SET_FIELD', field: 'newlyRegisteredUserId', value: userId }),
        (show) => dispatch({ type: 'SET_FIELD', field: 'showTagMenu', value: show })
      ),
    [setNotification]
  );

  // Memoized validation
  const validation = useMemo((): FormValidation => {
    const errors: Record<string, string> = {};

    // Check required fields first
    if (!formState.userName.trim()) {
      errors.userName = 'Please enter your name';
    } else if (!validateUserName(formState.userName)) {
      errors.userName = 'Username must be 3-20 characters';
    }

    if (!formState.birthYear) {
      errors.birthYear = 'Please select your birth year';
    } else if (!validateBirthYear(formState.birthYear)) {
      errors.birthYear = 'Invalid birth year (must be 13-100 years old)';
    }

    if (!formState.birthMonth) {
      errors.birthMonth = 'Please select your birth month';
    } else if (!validateBirthMonth(formState.birthMonth)) {
      errors.birthMonth = 'Please select a valid birth month';
    }

    if (!formState.sex) {
      errors.sex = 'Please select your sex';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [formState.userName, formState.birthYear, formState.birthMonth, formState.sex]);

  // Memoized options
  const options = useMemo(
    () => ({
      birthMonthOptions: Array.from({ length: 12 }, (_, i) => ({
        value: (i + 1).toString(),
        label: new Date(0, i).toLocaleString('default', { month: 'long' }),
      })),
      sexOptions: [
        { value: SexType.MALE, label: 'Male' },
        { value: SexType.FEMALE, label: 'Female' },
        { value: SexType.OTHER, label: 'Other' },
      ] as SelectOption[],
    }),
    []
  );

  // Optimized handlers
  const updateField = useCallback(
    <K extends keyof WelcomeFormState>(field: K, value: WelcomeFormState[K]) => {
      dispatch({ type: 'SET_FIELD', field, value });
    },
    []
  );

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', value: loading });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const handleRegistration = useCallback(
    async (data: UserRegistrationData) => {
      if (!validation.isValid) return;

      // Create a synthetic form event for the handler
      const syntheticEvent = {
        preventDefault: () => {
          // Empty method for synthetic event
        },
      } as React.FormEvent<HTMLFormElement>;

      await handler.handleUserRegistration(
        syntheticEvent,
        data.userName,
        data.birthYear,
        data.birthMonth,
        data.sex
      );
    },
    [validation.isValid, handler]
  );

  const handleLogin = useCallback(
    async (pigeonId: string) => {
      // Create a synthetic form event for the handler
      const syntheticEvent = {
        preventDefault: () => {
          // Empty method for synthetic event
        },
      } as React.FormEvent<HTMLFormElement>;

      await handler.handleLogin(syntheticEvent, pigeonId);
    },
    [handler]
  );

  const handleCopy = useCallback(
    (pigeonId: string) => {
      handler.copyToClipboard(pigeonId);
    },
    [handler]
  );

  const handleLoginWithTag = useCallback(
    (pigeonId: string, userId: string) => {
      handler.handleLoginWithTag(pigeonId, userId);
    },
    [handler]
  );

  return {
    formState,
    handlers: {
      updateField,
      handleRegistration,
      handleLogin,
      handleCopy,
      handleLoginWithTag,
      setLoading,
      reset,
    },
    validation,
    options,
  };
};
