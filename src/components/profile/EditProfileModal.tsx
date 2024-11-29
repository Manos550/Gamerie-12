import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { User } from '../../types';
import { updateProfile } from '../../lib/profile';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import BasicInfoTab from './edit-tabs/BasicInfoTab';
import PersonalInfoTab from './edit-tabs/PersonalInfoTab';
import SkillsTab from './edit-tabs/SkillsTab';
import SocialTab from './edit-tabs/SocialTab';
import MediaTab from './edit-tabs/MediaTab';

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  gamerTitle: z.enum(['Player', 'Streamer', 'Spectator', 'Coach', 'Trainer', 'Analyst']),
  gameLevel: z.enum(['Hobbyist', 'Amateur', 'Competitor', 'Pro']),
  bio: z.string().optional(),
  personalInfo: z.object({
    fullName: z.string().optional(),
    age: z.number().min(13).optional(),
    gender: z.string().optional(),
    location: z.string().optional(),
    profession: z.string().optional()
  }),
  skills: z.array(z.object({
    name: z.string().min(1, 'Skill name is required'),
    endorsements: z.array(z.object({
      userId: z.string(),
      timestamp: z.date()
    })).default([])
  })),
  platforms: z.array(z.enum(['PC', 'XBOX', 'PS5', 'Switch', 'Mobile'])),
  socialMedia: z.array(z.object({
    platform: z.string().min(1, 'Platform name is required'),
    username: z.string().min(1, 'Username is required'),
    url: z.string().url('Must be a valid URL')
  })),
  gamingAccounts: z.array(z.object({
    platform: z.string().min(1, 'Platform name is required'),
    username: z.string().min(1, 'Username is required'),
    url: z.string().url('Must be a valid URL').optional()
  }))
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface EditProfileModalProps {
  profile: User;
  onClose: () => void;
}

type TabType = 'basic' | 'personal' | 'skills' | 'social' | 'media';

export default function EditProfileModal({ profile, onClose }: EditProfileModalProps) {
  const queryClient = useQueryClient();
  const [currentTab, setCurrentTab] = useState<TabType>('basic');

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile.username,
      gamerTitle: profile.gamerTitle,
      gameLevel: profile.gameLevel,
      bio: profile.bio,
      personalInfo: profile.personalInfo,
      skills: profile.skills,
      platforms: profile.platforms,
      socialMedia: profile.socialMedia,
      gamingAccounts: profile.gamingAccounts
    }
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile(profile.id, data);
      queryClient.invalidateQueries({ queryKey: ['profile', profile.id] });
      toast.success('Profile updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'personal', label: 'Personal' },
    { id: 'skills', label: 'Skills' },
    { id: 'social', label: 'Social' },
    { id: 'media', label: 'Media' }
  ];

  const renderTabContent = () => {
    switch (currentTab) {
      case 'basic':
        return (
          <BasicInfoTab
            register={register}
            errors={errors}
          />
        );
      case 'personal':
        return (
          <PersonalInfoTab
            register={register}
            errors={errors}
          />
        );
      case 'skills':
        return (
          <SkillsTab
            control={control}
            register={register}
          />
        );
      case 'social':
        return (
          <SocialTab
            control={control}
            register={register}
          />
        );
      case 'media':
        return (
          <MediaTab
            profile={profile}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gaming-card rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-xl font-bold text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCurrentTab(tab.id)}
                className={`px-4 py-2 rounded-md whitespace-nowrap transition-colors ${
                  currentTab === tab.id
                    ? 'bg-gaming-neon text-black'
                    : 'bg-gaming-dark text-white hover:bg-gaming-neon/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mb-6">
            {renderTabContent()}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gaming-neon/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-gaming-neon text-black rounded-md hover:bg-gaming-neon/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}