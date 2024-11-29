import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { likePost, savePost } from '../../lib/news';
import { NewsPost as NewsPostType } from '../../types';

interface NewsPostProps {
  post: NewsPostType;
}

export default function NewsPost({ post }: NewsPostProps) {
  const { user } = useAuthStore();
  const [isLiked, setIsLiked] = React.useState(() => user ? post.likes.includes(user.id) : false);
  const [isSaved, setIsSaved] = React.useState(() => user ? post.saves.includes(user.id) : false);
  const [likesCount, setLikesCount] = React.useState(post.likes.length);

  const handleLike = async () => {
    if (!user) return;

    try {
      await likePost(post.id, !isLiked);
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      await savePost(post.id, !isSaved);
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  return (
    <article className="bg-gaming-card rounded-lg border border-gaming-neon/20 overflow-hidden">
      {/* Author Info */}
      <div className="p-4 flex items-center justify-between">
        <Link 
          to={`/profile/${post.authorId}`}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img
            src={post.authorImage}
            alt={post.authorName}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-medium text-white">{post.authorName}</h3>
            <span className="text-sm text-gray-400">
              {formatDistanceToNow(post.createdAt, { addSuffix: true })}
            </span>
          </div>
        </Link>
        <button className="text-gray-400 hover:text-white">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <h2 className="text-xl font-display font-bold text-white mb-2">
          {post.title}
        </h2>
        <p className="text-gray-300 mb-4">{post.content}</p>

        {/* Media Grid */}
        {post.media && post.media.length > 0 && (
          <div className={`grid gap-2 mb-4 ${
            post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
          }`}>
            {post.media.map((media, index) => (
              media.type === 'image' ? (
                <img
                  key={index}
                  src={media.url}
                  alt=""
                  className="rounded-lg w-full h-64 object-cover"
                />
              ) : (
                <video
                  key={index}
                  src={media.url}
                  controls
                  className="rounded-lg w-full h-64 object-cover"
                />
              )
            ))}
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <Link
                key={index}
                to={`/news/tag/${tag}`}
                className="px-3 py-1 rounded-full bg-gaming-dark text-gaming-neon text-sm hover:bg-gaming-neon/10"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gaming-neon/20">
          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 ${
                isLiked ? 'text-gaming-accent' : 'text-gray-400 hover:text-gaming-accent'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
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

          <button
            onClick={handleSave}
            className={`p-2 rounded-full ${
              isSaved ? 'text-gaming-neon' : 'text-gray-400 hover:text-gaming-neon'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </article>
  );
}