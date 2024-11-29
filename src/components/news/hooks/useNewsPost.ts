import { useState } from 'react';
import { useAuthStore } from '../../../lib/store';
import { likePost, savePost } from '../../../lib/news';
import { NewsPost } from '../../../types';

export function useNewsPost(post: NewsPost) {
  const { user } = useAuthStore();
  const [isLiked, setIsLiked] = useState(() => user ? post.likes.includes(user.id) : false);
  const [isSaved, setIsSaved] = useState(() => user ? post.saves.includes(user.id) : false);
  const [likesCount, setLikesCount] = useState(post.likes.length);

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

  return {
    isLiked,
    isSaved,
    likesCount,
    handleLike,
    handleSave
  };
}