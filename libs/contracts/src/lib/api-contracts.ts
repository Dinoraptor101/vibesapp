import { IUserData, ApiResponse, PaginatedResponse } from '@vibesapp/shared';

// ===== USER API CONTRACTS =====
export interface UserEndpoints {
  // GET /api/users/profile
  getProfile: {
    request: void;
    response: ApiResponse<IUserData>;
  };

  // PUT /api/users/profile
  updateProfile: {
    request: {
      username?: string;
      polarity?: string;
      mbtiPersonality?: string;
      profilePictureUrl?: string;
    };
    response: ApiResponse<IUserData>;
  };

  // GET /api/users/search
  searchUsers: {
    request: {
      query: string;
      page?: number;
      limit?: number;
    };
    response: PaginatedResponse<IUserData>;
  };

  // GET /api/users/nearby
  getUsersNearby: {
    request: {
      latitude: number;
      longitude: number;
      radius?: number;
      page?: number;
      limit?: number;
    };
    response: PaginatedResponse<IUserData>;
  };

  // PUT /api/users/{userId}/polarity
  updateUserPolarity: {
    request: {
      polarity: string;
    };
    response: ApiResponse<IUserData>;
  };
}

// ===== AUTH API CONTRACTS =====
export interface AuthEndpoints {
  // POST /api/auth/login
  login: {
    request: {
      username: string;
      password: string;
    };
    response: ApiResponse<{
      user: IUserData;
      token: string;
      refreshToken?: string;
    }>;
  };

  // POST /api/auth/register
  register: {
    request: {
      username: string;
      email: string;
      password: string;
      confirmPassword: string;
    };
    response: ApiResponse<{
      user: IUserData;
      token: string;
    }>;
  };

  // POST /api/auth/logout
  logout: {
    request: void;
    response: ApiResponse<void>;
  };

  // POST /api/auth/refresh
  refreshToken: {
    request: {
      refreshToken: string;
    };
    response: ApiResponse<{
      token: string;
      refreshToken?: string;
    }>;
  };
}
