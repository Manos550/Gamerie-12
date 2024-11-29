import React, { useState, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare, Share2, MoreHorizontal } from 'lucide-react';
import { Post } from '../../types';
import { useAuthStore } from '../../lib/store';
import { likePost, unlikePost } from '../../lib/posts';
import CommentSection from './CommentSection';

interface PostCardProps {
  post: Post;
}

const PostCard = memo(({ post }: PostCardProps) => {
  const { user } = useAuthStore();
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(() => user ? post.likes.includes(user.id) : false);
  const [likesCount, setLikesCount] = useState(post.likes.length);

  const handleLike = useCallback(async () => {
    if (!user) return;

    try {
      if (isLiked) {
        await unlikePost(post.id);
        setLikesCount(prev => prev - 1);
      } else {
        await likePost(post.id);
        setLikesCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  }, [isLiked, post.id, user]);

  const toggleComments = useCallback(() => {
    setShowComments(prev => !prev);
  }, []);

  return (
    <div className="bg-gaming-card rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <Link
          to={`/profile/${post.authorId}`}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img
            src={post.authorImage || 'https://via.placeholder.com/40'}
            alt=""
            className="w-10 h-10 rounded-full"
            loading="lazy"
          />
          <div>
            <h3 className="font-medium text-white">{post.authorName}</h3>
            <span className="text-sm text-gray-400">
              {formatDistanceToNow(post.createdAt, { addSuffix: true })}
            </span>
          </div>
        </Link>
        <button className="text-gray-400 hover:text-white">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <p className="text-gray-200 mb-4">{post.content}</p>

      {post.media && post.media.length > 0 && (
        <div className={`grid gap-2 mb-4 ${
          post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
        }`}>
          {post.media.map((url, index) => (
            <img
              key={index}
              src={url}
              alt=""
              className="rounded-lg w-full h-64 object-cover"
              loading="lazy"
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gaming-neon/20 pt-3">
        <button
          onClick={handleLike}
          className={`inline-flex items-center gap-1 text-xs rounded-md transition-colors ${
            isLiked ? 'text-gaming-accent' : 'text-gray-400 hover:text-gaming-accent'
          }`}
        >
          <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likesCount}</span>
        </button>

        <button
          onClick={toggleComments}
          className="inline-flex items-center gap-1 text-xs rounded-md text-gray-400 hover:text-gaming-neon transition-colors"
        >
          <MessageSquare className="w-3 h-3" />
          <span>{post.comments.length}</span>
        </button>

        <button className="inline-flex items-center gap-1 text-xs rounded-md text-gray-400 hover:text-gaming-neon transition-colors">
          <Share2 className="w-3 h-3" />
          <span>Share</span>
        </button>
      </div>

      {showComments && (
        <CommentSection postId={post.id} comments={post.comments} />
      )}
    </div>
  );
});

PostCard.displayName = 'PostCard';

export default PostCard;