export interface UserStatus {
  status: string;
  message: string;
  email: string;
  createdAt: string;
  attemptsRemaining: number;
  expiresIn: number;
}

export interface User {
  id: string;
  email: string;
  isActive: boolean;
  isVerified: boolean;
  bio?: string;
  profileImageUrl?: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// In your auth.ts or types file
export interface GoogleLoginInput {
  email: string;
  name?: string;
  googleId: string;
}

export interface GoogleLoginResponse {
  data: {
    googleLogin: {
      success: boolean;
      message: string;
      user?: {
        id: string;
        email: string;
        name?: string;
        role: string;
        isVerified: boolean;
        isActive?: boolean;
      };
      token?: {
        accessToken: string;
        refreshToken: string;
      };
    };
  };
}

export interface LoginResponse {
  data: {
    login: {
      success: boolean;
      message: string;
      user: User;
      token: TokenPair;
    };
  };
}

export interface RegistrationStatusResponse {
  data: {
    registrationStatus: {
      status: string;
      message: string;
      email?: string;
      createdAt?: string;
      attemptsRemaining?: number;
      expiresIn?: number;
    };
  };
}

export interface RegisterationInitateInput {
  email: string;
  password: string;
  bio?: string;
  profileImageUrl?: string;
  username: string;
  dateOfBirth: string;
  phoneNumber: string;
}

export interface VerifyRegisterationInput {
  email: string;
  otp: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ChangePasswordInput {
  token: string;
  newPassword: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface UserStatus {
  status: string;
  message: string;
  email: string;
  createdAt: string;
  attemptsRemaining: number;
  expiresIn: number;
}
export interface InitiateRegistration {
  message: string;
  status: UserStatus;
}

export interface RegistrationInitiateResponse {
  data: {
    initiateRegistration: InitiateRegistration;
  };
  errors: [
    {
      message: string;
    }
  ];
}

export interface ErrorResponse {
  message: string;
  locations?: Array<Location>;
  path?: Array<string>;
}

export interface VerifyRegistrationResponse {
  data: {
    verifyRegistration: {
      user?: User;
      token?: TokenPair;
    };
  } | null;
  errors?: Array<ErrorResponse>;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
  token: TokenPair;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}
