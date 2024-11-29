import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Post } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorDisplay from '../shared/ErrorDisplay';

interface ActivityFeedProps {
  userId: string;
}

export default function ActivityFeed({ userId }: ActivityFeedProps) {
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['activities', userId],
    queryFn: async () => {
      const q = query(
        collection(db, 'posts'),
        where('authorId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];
    }
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="bg-gaming-card rounded-lg border border-gaming-neon/20 overflow-hidden">
      <div className="p-6">
        <h2 className="font-display text-xl font-bold text-white mb-6">Recent Activity</h2>
        
        <div className="space-y-6">
          {activities?.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No recent activity</p>
          ) : (
            activities?.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 rounded-lg bg-gaming-dark/50"
              >
                <img
                  src={activity.media?.[0] || 'https://via.placeholder.com/40'}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-300">{activity.content}</p>
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <span className="text-gray-500">
                      {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gaming-neon">
                      {activity.likes.length} likes
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gaming-neon">
                      {activity.comments.length} comments
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}