import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { NewsPost as NewsPostType } from '../../types';
import CreateNewsPost from './CreateNewsPost';
import NewsPost from './NewsPost';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorDisplay from '../shared/ErrorDisplay';
import { useAuthStore } from '../../lib/store';
import { getDemoPosts } from '../../lib/news';

export default function NewsFeed() {
  const { user } = useAuthStore();

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      if (import.meta.env.MODE === 'development') {
        return getDemoPosts();
      }

      const q = query(
        collection(db, 'news'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as NewsPostType[];
    }
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {user && <CreateNewsPost />}

      <div className="space-y-6">
        {posts?.map((post) => (
          <NewsPost key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}