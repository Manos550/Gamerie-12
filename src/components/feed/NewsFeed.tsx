import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Post } from '../../types';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorDisplay from '../shared/ErrorDisplay';
import { useAuthStore } from '../../lib/store';
import { getDemoPosts } from '../../lib/posts';

export default function NewsFeed() {
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<'all' | 'following'>('all');

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['feed', filter],
    queryFn: async () => {
      if (import.meta.env.MODE === 'development') {
        return getDemoPosts();
      }

      const q = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];
    }
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {user && <CreatePost />}

      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-xl font-bold text-white">News Feed</h2>
        <div className="inline-flex items-center bg-gaming-dark rounded-lg p-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-gaming-neon text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All Posts
          </button>
          <button
            onClick={() => setFilter('following')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              filter === 'following'
                ? 'bg-gaming-neon text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Following
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {posts?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}