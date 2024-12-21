export interface SocialLink {
  platform: string;
  url: string;
}

export interface UserProfile {
  email: string;
  username: string;
  bio: string;
  dateOfBirth: string;
  profilePicture: string | null;
  tags: string[];
  socialLinks: SocialLink[];
  Phone_number: string;
}

export interface APIUserResponse {
  username: string;
  bio: string;
  email: string;
  dateOfBirth: string;
  profilePicture: string;
  tags: string[];
  socialLinks: SocialLink[];
  Phone_number: string;
}
