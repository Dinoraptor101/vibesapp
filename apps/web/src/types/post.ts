import type { PostStatus } from './enums';
import type { IUserData } from './user';

// Post-related type definitions
export interface IPost {
  _id: string;
  user: {
    userName: string;
  };
  image: string;
  text: string;
  status?: PostStatus;
  likes?: number;
  dislikes?: number;
  replies?: IPost[];
  createdAt?: string;
  updatedAt?: string;
  isWatched?: boolean; // Add for backward compatibility
}

export interface IPostData {
  _id: string;
  text: string;
  image: string;
  createdAt: string;
  user: {
    userId: string;
    userName: string;
    birthYear: number;
    birthMonth: number;
    age?: number;
    sex?: 'Male' | 'Female';
    location: {
      lat: number;
      lon: number;
    };
  };
  replyTo?: string;
  likes: string[];
  dislikes: string[];
  replies: IPostData[];
  isWatched: boolean;
  reactions?: Array<{
    type: 'like' | 'dislike';
    userId: string;
  }>;
}

export interface IReplyToPost {
  replyToPost: {
    _id: string;
    image: string;
    text: string;
  };
}

export interface IPage {
  results: IPost[];
  nextPage?: number;
  totalPosts?: number;
}

export interface IFetchPostsParams {
  pageParam?: number;
  lat: number;
  lon: number;
  range: number;
  withReplies: boolean;
}

export interface IUserPostsParams {
  userId: string;
  page?: number;
  limit?: number;
}

export interface IUserPostsResponse {
  results: IPost[];
  nextPage: number | null;
  totalPosts: number;
  totalPages: number;
}

export interface CreatePostRequest {
  text: string;
  image?: string;
  user: IUserData;
  location?: { lat: number; lon: number };
}

export interface UpdatePostRequest {
  text?: string;
  image?: string;
  status?: PostStatus;
}
