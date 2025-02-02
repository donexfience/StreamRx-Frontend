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

export interface ChatMessage {
  _id: string;
  channelId: string;
  senderId: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  content: string;
  messageType: "text" | "image" | "video" | "file";
  fileUrl?: string;
  reactions: {
    userId: string;
    emoji: string;
  }[];
  replies: {
    messageId: string;
    userId: {
      _id: string;
      name: string;
      profileImage?: string;
    };
    content: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}
