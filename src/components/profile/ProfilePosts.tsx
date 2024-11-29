import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Post } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Heart, Share2, Image } from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { createPost, likePost, unlikePost } from '../../lib/posts';
import { toast } from 'react-toastify';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorDisplay from '../shared/ErrorDisplay';

interface ProfilePostsProps {
  userId: string;
  isOwnProfile: boolean;
}

export default function ProfilePosts({ userId, isOwnProfile }: ProfilePostsProps) {
  const { user } = useAuthStore();
  const [newPost, setNewPost] = React.useState('');
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { data: posts, isLoading, error, refetch } = useQuery({
    queryKey: ['profile-posts', userId],
    queryFn: async () => {
      if (import.meta.env.MODE === 'development') {
        // Return demo posts
        return Array(3).fill(null).map((_, i) => ({
          id: `post-${i}`,
          authorId: userId,
          authorName: user?.username || 'User',
          authorImage: user?.profileImage || 'https://via.placeholder.com/40',
          content: `This is a demo post ${i + 1} for testing purposes.`,
          media: [],
          likes: [],
          comments: [],
          createdAt: new Date(Date.now() - i * 86400000),
          updatedAt: new Date(Date.now() - i * 86400000)
        }));
      }

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() && selectedFiles.length === 0) return;

    setIsSubmitting(true);
    try {
      await createPost(newPost, selectedFiles);
      setNewPost('');
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      refetch();
      toast.success('Post created successfully');
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
      refetch();
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="bg-gaming-card rounded-lg border border-gaming-neon/20">
      <div className="p-6">
        <h2 className="font-display text-xl font-bold text-white mb-6">Posts</h2>

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

              {selectedFiles.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt=""
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between mt-4">
                <label className="flex items-center gap-2 text-gray-400 hover:text-gaming-neon cursor-pointer">
                  <Image className="w-5 h-5" />
                  <span>Add Image</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*"
                    multiple
                  />
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting || (!newPost.trim() && selectedFiles.length === 0)}
                  className="px-4 py-2 bg-gaming-neon text-black rounded-md hover:bg-gaming-neon/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-6">
          {posts?.length === 0 ? (
            <p className="text-center py-4 text-gray-400">No posts yet</p>
          ) : (
            posts?.map((post) => {
              const isLiked = user ? post.likes.includes(user.id) : false;

              return (
                <div
                  key={post.id}
                  className="bg-gaming-dark/50 rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={post.authorImage}
                      alt=""
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="font-medium text-white">{post.authorName}</div>
                      <div className="text-sm text-gray-400">
                        {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-300">{post.content}</p>

                  {post.media && post.media.length > 0 && (
                    <div className={`grid gap-2 ${
                      post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
                    }`}>
                      {post.media.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt=""
                          className="rounded-lg w-full h-64 object-cover"
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-6 pt-4 border-t border-gaming-neon/20">
                    <button
                      onClick={() => handleLike(post.id, isLiked)}
                      className={`flex items-center gap-2 ${
                        isLiked ? 'text-gaming-accent' : 'text-gray-400 hover:text-gaming-accent'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{post.likes.length}</span>
                    </button>

                    <button className="flex items-center gap-2 text-gray-400 hover:text-gaming-neon">
                      <MessageSquare className="w-5 h-5" />
                      <span>{post.comments.length}</span>
                    </button>

                    <button className="flex items-center gap-2 text-gray-400 hover:text-gaming-neon">
                      <Share2 className="w-5 h-5" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}