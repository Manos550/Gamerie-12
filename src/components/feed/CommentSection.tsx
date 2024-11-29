import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatDistanceToNow } from 'date-fns';
import { Comment } from '../../types';
import { useAuthStore } from '../../lib/store';
import { addComment } from '../../lib/posts';
import { useQueryClient } from '@tanstack/react-query';

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty')
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
}

export default function CommentSection({ postId, comments }: CommentSectionProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema)
  });

  const onSubmit = async (data: CommentFormData) => {
    if (!user) return;

    try {
      await addComment(postId, data.content);
      reset();
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="mt-4 border-t border-gaming-neon/20 pt-4">
      {/* Comment Form */}
      {user && (
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-4 mb-6">
          <img
            src={user.profileImage || 'https://via.placeholder.com/32'}
            alt={user.username}
            className="w-8 h-8 rounded-full"
          />
          <div className="flex-1">
            <input
              {...register('content')}
              type="text"
              placeholder="Write a comment..."
              className="w-full bg-gaming-dark/50 rounded-full px-4 py-2 text-white placeholder-gray-400 border border-gaming-neon/20 focus:border-gaming-neon focus:ring-0"
            />
            {errors.content && (
              <p className="mt-1 text-sm text-gaming-accent">{errors.content.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-gaming-neon text-black rounded-full hover:bg-gaming-neon/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <img
              src={comment.authorImage || 'https://via.placeholder.com/32'}
              alt=""
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
              <div className="bg-gaming-dark/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-white">{comment.authorName}</span>
                  <span className="text-sm text-gray-400">
                    {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                  </span>
                </div>
                <p className="text-gray-200">{comment.content}</p>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <button className="text-gray-400 hover:text-gaming-neon">Like</button>
                <button className="text-gray-400 hover:text-gaming-neon">Reply</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}