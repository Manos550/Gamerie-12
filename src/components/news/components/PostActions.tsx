import React from 'react';
import { Heart, MessageSquare, Share2, Bookmark } from 'lucide-react';

interface PostActionsProps {
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isSaved: boolean;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
}

export default function PostActions({
  likesCount,
  commentsCount,
  isLiked,
  isSaved,
  onLike,
  onSave,
  onShare
}: PostActionsProps) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-gaming-neon/20">
      <div className="flex items-center gap-6">
        <button
          onClick={onLike}
          className={`flex items-center gap-2 ${
            isLiked ? 'text-gaming-accent' : 'text-gray-400 hover:text-gaming-accent'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likesCount}</span>
        </button>

        <button className="flex items-center gap-2 text-gray-400 hover:text-gaming-neon">
          <MessageSquare className="w-5 h-5" />
          <span>{commentsCount}</span>
        </button>

        <button
          onClick={onShare}
          className="flex items-center gap-2 text-gray-400 hover:text-gaming-neon"
        >
          <Share2 className="w-5 h-5" />
          <span>Share</span>
        </button>
      </div>

      <button
        onClick={onSave}
        className={`p-2 rounded-full ${
          isSaved ? 'text-gaming-neon' : 'text-gray-400 hover:text-gaming-neon'
        }`}
      >
        <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
      </button>
    </div>
  );
}