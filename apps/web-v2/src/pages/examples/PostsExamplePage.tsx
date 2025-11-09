/**
 * Post Components Example Page
 *
 * Demonstrates all post-related components with sample data.
 * For development and testing purposes only.
 */

import { useState } from 'react';
import { PostCard, PostSkeleton, ImageViewer } from '@/features/posts';
import type { Post } from '@/features/posts';

// Sample post data matching Post type from MongoDB model
const samplePosts: Post[] = [
  {
    _id: '1',
    text: 'Beautiful sunset at the beach today! 🌅 Perfect weather for a walk.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    user: {
      userId: 'user1',
      userName: 'john_doe',
      birthYear: 1995,
      birthMonth: 6,
      sex: 'male',
      location: {
        lat: 37.7749,
        lon: -122.4194,
        city: 'San Francisco',
      },
      mbtiPersonality: 'INTJ',
    },
    reactions: [],
    proximal_likes: 15,
    proximal_dislikes: 3,
    proximal_users: 23,
    isHidden: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    _id: '2',
    text: 'Just tried this amazing coffee shop in Brooklyn! ☕️ Highly recommend the caramel latte.',
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800',
    user: {
      userId: 'user2',
      userName: 'jane_smith',
      birthYear: 1992,
      birthMonth: 3,
      sex: 'female',
      location: {
        lat: 40.6782,
        lon: -73.9442,
        city: 'Brooklyn',
      },
      mbtiPersonality: 'ENFP',
    },
    reactions: [
      {
        userId: 'currentUser',
        type: 'like',
        location: {
          lat: 40.7128,
          lon: -74.006,
        },
      },
    ],
    proximal_likes: 28,
    proximal_dislikes: 5,
    proximal_users: 45,
    isHidden: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    _id: '3',
    text: 'Working on a new project. The struggle is real but loving every moment! 💻',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    user: {
      userId: 'user3',
      userName: 'alex_dev',
      birthYear: 1998,
      birthMonth: 11,
      sex: 'male',
      location: {
        lat: 30.2672,
        lon: -97.7431,
        city: 'Austin',
      },
      mbtiPersonality: 'ISTP',
    },
    reactions: [
      {
        userId: 'user5',
        type: 'dislike',
        location: {
          lat: 30.2711,
          lon: -97.7437,
        },
      },
    ],
    proximal_likes: 8,
    proximal_dislikes: 3,
    proximal_users: 12,
    isHidden: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

export default function PostsExamplePage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = (postId: string) => {
    console.log('Like post:', postId);
  };

  const handleReport = (postId: string) => {
    console.log('Report post:', postId);
  };

  const handleComment = (postId: string) => {
    console.log('Comment on post:', postId);
  };

  const toggleLoading = () => {
    setIsLoading(!isLoading);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Post Components Examples</h1>
          <p className="text-muted-foreground">
            Sample post cards with various states and content types.
          </p>
          <button
            type="button"
            onClick={toggleLoading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Toggle Loading State
          </button>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Loading State</h2>
            <PostSkeleton />
            <PostSkeleton />
          </div>
        )}

        {/* Sample Posts */}
        {!isLoading && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Sample Posts</h2>
            {samplePosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onLike={handleLike}
                onReport={handleReport}
                onComment={handleComment}
              />
            ))}
          </div>
        )}

        {/* Component States */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Component States</h2>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">With Image</h3>
            <PostCard
              post={samplePosts[0]}
              onLike={handleLike}
              onReport={handleReport}
              onComment={handleComment}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">With User Reaction</h3>
            <PostCard
              post={samplePosts[1]}
              onLike={handleLike}
              onReport={handleReport}
              onComment={handleComment}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Text + Image</h3>
            <PostCard
              post={samplePosts[2]}
              onLike={handleLike}
              onReport={handleReport}
              onComment={handleComment}
            />
          </div>
        </div>
      </div>

      {/* Image Viewer */}
      {selectedImage && (
        <ImageViewer
          imageUrl={selectedImage}
          alt="Post image"
          open={!!selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
