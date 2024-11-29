import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Megaphone, Plus, X, Image } from 'lucide-react';
import { createOfficialPost } from '../../lib/moderation';
import { useQueryClient } from '@tanstack/react-query';

const postSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['announcement', 'update', 'event', 'maintenance']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  tags: z.array(z.string()).optional(),
  media: z.instanceof(FileList).optional()
});

type PostFormData = z.infer<typeof postSchema>;

export default function OfficialPostsSection() {
  const [showCreateModal, setShowCreateModal] = useState(false);
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
    try {
      await createOfficialPost({
        title: data.title,
        content: data.content,
        type: data.type,
        priority: data.priority,
        media: Array.from(data.media || [])
      });

      reset();
      setPreview([]);
      setShowCreateModal(false);
      queryClient.invalidateQueries({ queryKey: ['official-posts'] });
    } catch (error) {
      console.error('Error creating official post:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-gaming-neon" />
          <h2 className="font-display text-xl font-bold text-white">Official Posts</h2>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gaming-neon text-black rounded-md hover:bg-gaming-neon/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Post
        </button>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gaming-card rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-xl font-bold text-white">Create Official Post</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Title
                </label>
                <input
                  {...register('title')}
                  type="text"
                  className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
                  placeholder="Post title..."
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-gaming-accent">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Content
                </label>
                <textarea
                  {...register('content')}
                  rows={5}
                  className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon resize-none"
                  placeholder="Post content..."
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-gaming-accent">{errors.content.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    {...register('type')}
                    className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
                  >
                    <option value="announcement">Announcement</option>
                    <option value="update">Update</option>
                    <option value="event">Event</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    {...register('priority')}
                    className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {preview.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
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

              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-gray-400 hover:text-gaming-neon cursor-pointer">
                  <Image className="w-5 h-5" />
                  <span>Add Media</span>
                  <input
                    type="file"
                    {...register('media')}
                    className="hidden"
                    accept="image/*"
                    multiple
                  />
                </label>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-gaming-neon text-black rounded-md hover:bg-gaming-neon/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Post'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}