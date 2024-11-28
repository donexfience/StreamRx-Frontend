export interface UserStatus{
    status:string
    message:string
    email:string
    createdAt:string
    attemptsRemaining:number
    expiresIn:number
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
  
  export interface LoginResponse {
    success: boolean;
    message: string;
    user: User;
    token: TokenPair;
  }
  


export interface RegisterationInitateInput{
    email:string
    password:string
    bio?:string
    profileImageUrl?:string
}

export interface VerifyRegisterationInput{
    email:string
    otp:string
}

export interface LoginInput {
    email: string
    password: string
}
  
  export interface ChangePasswordInput {
    token: string
    newPassword: string
  }
  

  
export interface TokenPair {
    accessToken: string
    refreshToken: string
}
  
export interface RegistrationInitiateResponse {
    message: string
    status: UserStatus
}
  
export interface VerifyRegistrationResponse {
    user: User
    token: TokenPair
}
  
export interface LoginResponse {
    success: boolean
    message: string
    user: User
    token: TokenPair
}
  
export interface ForgotPasswordResponse {
    success: boolean
    message: string
}
  
export interface ChangePasswordResponse {
    success: boolean
    message: string
}