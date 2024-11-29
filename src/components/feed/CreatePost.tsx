import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Image, X } from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { createPost } from '../../lib/posts';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

const postSchema = z.object({
  content: z.string().min(1, 'Post content is required'),
  media: z.instanceof(FileList).optional()
});

type PostFormData = z.infer<typeof postSchema>;

export default function CreatePost() {
  const { user } = useAuthStore();
  const [preview, setPreview] = useState<string[]>([]);
  const queryClient = useQueryClient();
  
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

  const onSubmit = async (data: PostFormData) => {
    if (!user) return;

    try {
      await createPost(data.content, Array.from(data.media || []));
      reset();
      setPreview([]);
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      toast.success('Post created successfully');
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-gaming-card rounded-lg p-4">
      <div className="flex gap-4">
        <img
          src={user.profileImage || 'https://via.placeholder.com/40'}
          alt={user.username}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <textarea
            {...register('content')}
            placeholder="Share your gaming moments..."
            className="w-full bg-gaming-dark/50 rounded-lg p-3 text-white placeholder-gray-400 border border-gaming-neon/20 focus:border-gaming-neon focus:ring-0 resize-none"
            rows={3}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-gaming-accent">{errors.content.message}</p>
          )}

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
          <Image className="w-4 h-4" />
          <span className="text-xs">Add Media</span>
          <input
            type="file"
            {...register('media')}
            className="hidden"
            accept="image/*"
            multiple
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-3 py-1 text-xs bg-gaming-neon text-black rounded-md hover:bg-gaming-neon/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
}