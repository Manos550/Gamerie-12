import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Post } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Heart, Share2, Image } from 'lucide-react';
import { toast } from 'react-toastify';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorDisplay from '../shared/ErrorDisplay';

interface ProfileWallProps {
  userId: string;
  isOwnProfile: boolean;
}

export default function ProfileWall({ userId, isOwnProfile }: ProfileWallProps) {
  const [newPost, setNewPost] = useState('');
  const queryClient = useQueryClient();

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['wall-posts', userId],
    queryFn: async () => {
      const q = query(
        collection(db, 'posts'),
        where('authorId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];
    }
  });

  const createPost = useMutation({
    mutationFn: async (content: string) => {
      const post = {
        authorId: userId,
        content,
        likes: [],
        comments: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await addDoc(collection(db, 'posts'), post);
    },
    onSuccess: () => {
      setNewPost('');
      queryClient.invalidateQueries({ queryKey: ['wall-posts', userId] });
      toast.success('Post created successfully');
    },
    onError: () => {
      toast.error('Failed to create post');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    createPost.mutate(newPost);
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="bg-gaming-card rounded-lg border border-gaming-neon/20">
      <div className="p-6">
        <h2 className="font-display text-xl font-bold text-white mb-6">Wall</h2>

        {isOwnProfile && (
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="bg-gaming-dark/50 rounded-lg p-4">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share your gaming moments..."
                className="w-full bg-transparent border-none resize-none focus:ring-0 text-white placeholder-gray-400"
                rows={3}
              />
              <div className="flex items-center justify-between mt-4">
                <button
                  type="button"
                  className="flex items-center gap-2 text-gray-400 hover:text-gaming-neon"
                >
                  <Image className="w-5 h-5" />
                  <span>Add Image</span>
                </button>
                <button
                  type="submit"
                  disabled={!newPost.trim() || createPost.isPending}
                  className="px-4 py-2 bg-gaming-neon text-black rounded-md hover:bg-gaming-neon/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {createPost.isPending ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-6">
          {posts?.length === 0 ? (
            <p className="text-center py-4 text-gray-400">No posts yet</p>
          ) : (
            posts?.map((post) => (
              <div
                key={post.id}
                className="bg-gaming-dark/50 rounded-lg p-4 space-y-4"
              >
                <p className="text-gray-300">{post.content}</p>

                {post.media && post.media.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {post.media.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt=""
                        className="rounded-lg w-full h-48 object-cover"
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                  </span>
                  
                  <div className="flex items-center gap-6">
                    <button className="flex items-center gap-1 text-gray-400 hover:text-gaming-neon">
                      <Heart className="w-4 h-4" />
                      <span>{post.likes.length}</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-400 hover:text-gaming-neon">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.comments.length}</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-400 hover:text-gaming-neon">
                      <Share2 className="w-4 h-4" />
                    </button>
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