import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Flag, X } from 'lucide-react';
import { createReport } from '../../lib/moderation';
import { useAuthStore } from '../../lib/store';
import { ReportType } from '../../types';

const reportSchema = z.object({
  type: z.enum(['spam', 'harassment', 'inappropriate', 'other'] as const),
  reason: z.string().min(10, 'Please provide more details').max(500),
});

type ReportFormData = z.infer<typeof reportSchema>;

interface ReportButtonProps {
  contentId: string;
  contentType: ReportType;
  contentAuthorId: string;
}

export default function ReportButton({ contentId, contentType, contentAuthorId }: ReportButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuthStore();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema)
  });

  const onSubmit = async (data: ReportFormData) => {
    if (!user) return;

    try {
      await createReport({
        contentId,
        contentType,
        contentAuthorId,
        reporterId: user.id,
        type: data.type,
        reason: data.reason
      });

      reset();
      setShowModal(false);
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-gray-400 hover:text-gaming-accent transition-colors"
        title="Report content"
      >
        <Flag className="w-4 h-4" />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gaming-card rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-xl font-bold text-white">Report Content</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Report Type
                </label>
                <select
                  {...register('type')}
                  className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
                >
                  <option value="spam">Spam</option>
                  <option value="harassment">Harassment</option>
                  <option value="inappropriate">Inappropriate Content</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Details
                </label>
                <textarea
                  {...register('reason')}
                  rows={4}
                  className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon resize-none"
                  placeholder="Please provide details about your report..."
                />
                {errors.reason && (
                  <p className="mt-1 text-sm text-gaming-accent">{errors.reason.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gaming-neon text-black rounded-md hover:bg-gaming-neon/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}