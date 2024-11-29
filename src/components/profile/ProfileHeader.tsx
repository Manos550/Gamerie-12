import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../types';
import { Calendar, Trophy, Users, UserPlus, UserMinus, Shield, Swords } from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { signOut } from '../../lib/auth';
import EditProfileModal from './EditProfileModal';
import FollowersList from './FollowersList';
import OnlineStatus from '../shared/OnlineStatus';
import UserChallengeModal from '../challenges/UserChallengeModal';
import ReportButton from '../shared/ReportButton';

interface ProfileHeaderProps {
  profile: User;
  isOwnProfile: boolean;
}

export default function ProfileHeader({ profile, isOwnProfile }: ProfileHeaderProps) {
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const { user } = useAuthStore();
  const isFollowing = user ? profile.followers.includes(user.id) : false;

  const handleFollowChange = () => {
    window.location.reload();
  };

  return (
    <div className="relative space-y-4">
      {/* Background Image */}
      <div className="h-96 w-full relative">
        <img
          src={profile.backgroundImage || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80'}
          alt="Profile Background"
          className="w-full h-full object-cover rounded-lg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gaming-card to-transparent" />

        {/* Report Button */}
        {user && !isOwnProfile && (
          <div className="absolute top-4 right-4">
            <ReportButton
              contentId={profile.id}
              contentType="user"
              contentAuthorId={profile.id}
            />
          </div>
        )}

        {/* Profile Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end justify-between gap-6">
            <div className="flex items-end gap-6">
              <img
                src={profile.profileImage || 'https://via.placeholder.com/150'}
                alt={profile.username}
                className="w-32 h-32 rounded-full border-4 border-gaming-card relative z-10"
              />
              <div className="flex-1 relative z-10">
                <h1 className="text-4xl font-display font-bold text-white">
                  {profile.username}
                </h1>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-gray-300">Status:</span>
                  <OnlineStatus userId={profile.id} showText />
                </div>

                <div className="text-gaming-neon">{profile.gamerTitle}</div>

                <div className="text-sm text-gray-300">
                  Gamer Level: <span className="text-blue-500">{profile.gameLevel}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 relative z-10">
              {isOwnProfile ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-gaming-neon text-black rounded-md hover:bg-gaming-neon/90 transition-colors flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowChallengeModal(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gaming-accent text-white rounded-md hover:bg-gaming-accent/90 transition-colors"
                  >
                    <Swords className="w-3.5 h-3.5" />
                    Challenge
                  </button>
                  <button
                    onClick={handleFollowChange}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                      isFollowing
                        ? 'bg-gaming-dark border border-gaming-neon text-gaming-neon hover:bg-gaming-neon hover:text-black'
                        : 'bg-gaming-neon text-black hover:bg-gaming-neon/90'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="w-3.5 h-3.5" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        Follow
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isEditing && (
        <EditProfileModal
          profile={profile}
          onClose={() => setIsEditing(false)}
        />
      )}

      {showFollowers && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <FollowersList
              userId={profile.id}
              type="followers"
              userIds={profile.followers}
            />
            <button
              onClick={() => setShowFollowers(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {showFollowing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <FollowersList
              userId={profile.id}
              type="following"
              userIds={profile.following}
            />
            <button
              onClick={() => setShowFollowing(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {showChallengeModal && !isOwnProfile && (
        <UserChallengeModal
          targetUserId={profile.id}
          targetUsername={profile.username}
          onClose={() => setShowChallengeModal(false)}
        />
      )}
    </div>
  );
}