import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { signIn, signUp } from '../../lib/auth';
import { UserRole } from '../../types';
import AuthError from './AuthError';
import { Shield } from 'lucide-react';

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  role: z.enum(['user', 'scouter', 'coach', 'team_owner', 'influencer'] as const).optional()
});

type AuthFormData = z.infer<typeof authSchema>;

interface AuthFormProps {
  mode: 'login' | 'register';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [adminClicks, setAdminClicks] = useState(0);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema)
  });

  const onSubmit = async (data: AuthFormData) => {
    try {
      setError(null);
      if (mode === 'register') {
        await signUp(data.email, data.password, data.username!, data.role as UserRole);
      } else {
        await signIn(data.email, data.password);
      }
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during authentication';
      setError(errorMessage);
      console.error('Authentication error:', err);
    }
  };

  const handleAdminAccess = () => {
    const newCount = adminClicks + 1;
    setAdminClicks(newCount);
    
    if (newCount === 5) {
      setTimeout(() => {
        setAdminClicks(0);
        navigate('/admin');
      }, 0);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gaming-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gaming-card p-8 rounded-lg shadow-xl border border-gaming-neon/20">
        <div>
          <h2 className="mt-6 text-center text-3xl font-display font-bold text-white">
            {mode === 'login' ? 'Sign in to Gamerie' : 'Create your account'}
          </h2>
          <div className="mt-2 flex justify-center">
            <button
              onClick={handleAdminAccess}
              className="p-2 opacity-0 hover:opacity-100 transition-opacity"
              type="button"
            >
              <Shield className="w-6 h-6 text-gaming-neon" />
            </button>
          </div>
        </div>

        {error && <AuthError message={error} />}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm space-y-4">
            {mode === 'register' && (
              <div>
                <label htmlFor="username" className="sr-only">Username</label>
                <input
                  {...register('username')}
                  type="text"
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gaming-neon/20 bg-gaming-dark text-white placeholder-gray-400 focus:outline-none focus:ring-gaming-neon focus:border-gaming-neon focus:z-10 sm:text-sm"
                  placeholder="Username"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-gaming-accent">{errors.username.message}</p>
                )}
              </div>
            )}
            
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
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                {...register('password')}
                type="password"
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gaming-neon/20 bg-gaming-dark text-white placeholder-gray-400 focus:outline-none focus:ring-gaming-neon focus:border-gaming-neon focus:z-10 sm:text-sm"
                placeholder="Password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-gaming-accent">{errors.password.message}</p>
              )}
            </div>

            {mode === 'register' && (
              <div>
                <label htmlFor="role" className="sr-only">Account Type</label>
                <select
                  {...register('role')}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gaming-neon/20 bg-gaming-dark text-white placeholder-gray-400 focus:outline-none focus:ring-gaming-neon focus:border-gaming-neon focus:z-10 sm:text-sm"
                >
                  <option value="user">Regular User</option>
                  <option value="scouter">Scouter</option>
                  <option value="coach">Coach</option>
                  <option value="team_owner">Team Owner</option>
                  <option value="influencer">Influencer</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-gaming-neon hover:bg-gaming-neon/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gaming-neon disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Processing...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}