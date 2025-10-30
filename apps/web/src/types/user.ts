import { PolarityType, SexType } from './enums';
import type { IGeoLocation } from './location';

// Re-export enums for convenience
export { SexType, PolarityType };

// User-related type definitions
export interface IUserData {
  userId: string;
  pigeonId: string;
  userName: string;
  vibes: number;
  location: IGeoLocation;
  birthYear: number;
  birthMonth: number;
  sex: SexType;
  mbtiPersonality?: string;
  polarity?: PolarityType;
  createdAt: string;
  updatedAt: string;
}

export interface UserRegistrationData {
  userName: string;
  birthYear: string;
  birthMonth: string;
  sex: SexType;
}

export interface UserLoginData {
  pigeonId: string;
}

// Legacy support - will be deprecated
export interface UserData {
  userId: string;
  userName: string;
  age: number;
  sex: string;
  vibes: number;
  location: string;
}
