export interface User {
  id: string;
  email: string;
  isActive: boolean;
  isVerified: boolean;
  bio?: string;
  profileImageUrl?: string;
  role: string;
}

interface SocialLink {
  url: string;
}

export interface UserResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    isActive: boolean;
    tags: string[];
    social_links: SocialLink[];
    date_of_birth: string;
    bio: string;
    profileImageURL: string;
    phone_number: string;
  };
}

interface Users {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  tags: string;
  profileImageURL: string;
  phone_number: string;
}

export interface GetALlUserResponse {
  users: Users[];
}

export interface UpdateUserInput {
  email: string;
  username: string;
  bio: string;
  dateOfBirth: string;
  profileImageURL: string | null;
  tags: string[];
  socialLinks: { platform: string; url: string }[];
  phonenumber: string;
}
