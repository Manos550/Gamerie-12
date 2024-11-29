import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Image, X, Plus } from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { createNewsPost } from '../../lib/news';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

const postSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  tags: z.array(z.string()).optional(),
  media: z.instanceof(FileList).optional()
});

type PostFormData = z.infer<typeof postSchema>;

export default function CreateNewsPost() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<PostFormData>({
    resolver: zodResolver(postSchema)
  });

  const mediaFiles = watch('media');

  React.useEffect(() => {
    if (mediaFiles?.length) {
      const urls = Array.from(mediaFiles).map(file => URL.createObjectURL(file));
      setPreview(urls);
      return () => urls.forEach(url => URL.revokeObjectURL(url));
    }
  }, [mediaFiles]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (data: PostFormData) => {
    if (!user) return;

    try {
      await createNewsPost({
        title: data.title,
        content: data.content,
        tags,
        media: Array.from(data.media || [])
      });

      reset();
      setPreview([]);
      setTags([]);
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast.success('Post created successfully');
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-gaming-card rounded-lg p-4 mb-6">
      <div className="flex gap-4">
        <img
          src={user.profileImage}
          alt={user.username}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <input
            {...register('title')}
            placeholder="Post title..."
            className="w-full bg-gaming-dark/50 rounded-lg p-3 mb-2 text-white placeholder-gray-400 border border-gaming-neon/20 focus:border-gaming-neon focus:ring-0"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-gaming-accent">{errors.title.message}</p>
          )}

          <textarea
            {...register('content')}
            placeholder="Share your gaming news and updates..."
            className="w-full bg-gaming-dark/50 rounded-lg p-3 text-white placeholder-gray-400 border border-gaming-neon/20 focus:border-gaming-neon focus:ring-0 resize-none"
            rows={3}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-gaming-accent">{errors.content.message}</p>
          )}

          {/* Tags Input */}
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-gaming-dark text-gaming-neon text-sm flex items-center gap-2"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-gaming-accent"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add tags..."
              className="px-3 py-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
            />
          </div>

          {/* Media Preview */}
          {preview.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {preview.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt=""
                    className="rounded-lg w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreview(prev => prev.filter((_, i) => i !== index));
                      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                      if (input) input.value = '';
                    }}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <label className="flex items-center gap-2 text-gray-400 hover:text-gaming-neon cursor-pointer">
          <Image className="w-5 h-5" />
          <span>Add Media</span>
          <input
            type="file"
            {...register('media')}
            className="hidden"
            accept="image/*,video/*"
            multiple
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-gaming-neon text-black rounded-md hover:bg-gaming-neon/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
}