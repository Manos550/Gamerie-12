import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { resetPassword } from '../../lib/auth';
import { Mail } from 'lucide-react';

const resetSchema = z.object({
  email: z.string().email('Invalid email address')
});

type ResetFormData = z.infer<typeof resetSchema>;

export default function ResetPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema)
  });

  const onSubmit = async (data: ResetFormData) => {
    setIsSubmitting(true);
    try {
      await resetPassword(data.email);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gaming-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gaming-card p-8 rounded-lg shadow-xl border border-gaming-neon/20">
        <div>
          <div className="mx-auto flex justify-center">
            <Mail className="w-12 h-12 text-gaming-neon" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-display font-bold text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              {...register('email')}
              type="email"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gaming-neon/20 bg-gaming-dark text-white placeholder-gray-400 focus:outline-none focus:ring-gaming-neon focus:border-gaming-neon focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-gaming-accent">{errors.email.message}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-gaming-neon hover:bg-gaming-neon/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gaming-neon disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}