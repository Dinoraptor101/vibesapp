// UI-related type definitions
export interface WelcomeFormState {
  birthYear: string;
  birthMonth: string;
  sex: string;
  loading: boolean;
  userName: string;
  existingPigeonId: string;
  newlyRegisteredPigeonId: string | null;
  newlyRegisteredUserId: string | null;
  showTagMenu: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface StateAction<T = unknown> {
  type: string;
  field?: keyof T;
  payload?: T;
  value?: unknown;
}

export type INavigate = (_to: string, _options?: { replace?: boolean; state?: unknown }) => void;

export interface ITooltip {
  visible: boolean;
  message: string;
  position?: { x: number; y: number };
}

export type IHandleReply = (_parentMessageId: string | null, _userName: string | null) => void;
