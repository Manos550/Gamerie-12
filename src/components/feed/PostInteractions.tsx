import React from 'react';
import { Heart, MessageSquare, Share2 } from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { likePost } from '../../lib/posts';
import { toast } from 'react-toastify';

interface PostInteractionsProps {
  postId: string;
  likes: string[];
  commentsCount: number;
  onCommentClick: () => void;
}

export default function PostInteractions({ 
  postId, 
  likes, 
  commentsCount, 
  onCommentClick 
}: PostInteractionsProps) {
  const { user } = useAuthStore();
  const [isLiked, setIsLiked] = React.useState(() => 
    user ? likes.includes(user.id) : false
  );
  const [likesCount, setLikesCount] = React.useState(likes.length);

  const handleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like posts');
      return;
    }

    try {
      await likePost(postId);
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this post',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div className="flex items-center justify-between pt-4 border-t border-gaming-neon/20">
      <button
        onClick={handleLike}
        className={`flex items-center gap-2 ${
          isLiked ? 'text-gaming-accent' : 'text-gray-400 hover:text-gaming-accent'
        }`}
      >
        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
        <span>{likesCount}</span>
      </button>

      <button
        onClick={onCommentClick}
        className="flex items-center gap-2 text-gray-400 hover:text-gaming-neon"
      >
        <MessageSquare className="w-5 h-5" />
        <span>{commentsCount}</span>
      </button>

      <button
        onClick={handleShare}
        className="flex items-center gap-2 text-gray-400 hover:text-gaming-neon"
      >
        <Share2 className="w-5 h-5" />
        <span>Share</span>
      </button>
    </div>
  );
}