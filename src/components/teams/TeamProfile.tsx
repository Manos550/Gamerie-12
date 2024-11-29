import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Team } from '../../types';
import { useAuthStore } from '../../lib/store';
import { getDemoTeams, deleteTeam } from '../../lib/teams';
import { Settings, UserPlus, Users, LogOut, Trash2, Globe, MapPin, Clock, Trophy, Calendar, Swords } from 'lucide-react';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorDisplay from '../shared/ErrorDisplay';
import EditTeamModal from './EditTeamModal';
import ManageMembersModal from './ManageMembersModal';
import JoinRequestsModal from './JoinRequestsModal';
import InviteMembersModal from './InviteMembersModal';
import TransferOwnershipModal from './TransferOwnershipModal';
import TeamChallengeModal from '../challenges/TeamChallengeModal';
import ReportButton from '../shared/ReportButton';
import TeamFollowButton from './TeamFollowButton';
import TeamMatchesList from './TeamMatchesList';

export default function TeamProfile() {
  const { teamId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const isDemoMode = import.meta.env.MODE === 'development';

  const [showEditModal, setShowEditModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [currentTab, setCurrentTab] = useState<'overview' | 'matches'>('overview');

  // Fetch team data
  const { data: team, isLoading, error } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      if (isDemoMode) {
        const demoTeams = getDemoTeams();
        const team = demoTeams.find(t => t.id === teamId);
        if (!team) throw new Error('Team not found');
        return team;
      }

      const docRef = doc(db, 'teams', teamId!);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Team not found');
      }
      
      return { id: docSnap.id, ...docSnap.data() } as Team;
    },
    enabled: Boolean(teamId)
  });

  const handleDeleteTeam = async () => {
    if (!team || !window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteTeam(team.id);
      navigate('/teams');
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  if (!team) return null;

  const isTeamMember = user ? team.members.some(member => member.userId === user.id) : false;
  const isTeamOwner = user ? team.ownerId === user.id : false;
  const isTeamLeader = user ? team.members.some(member => 
    member.userId === user.id && (member.role === 'Leader' || member.role === 'owner')
  ) : false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Team Header */}
      <div className="relative rounded-lg overflow-hidden mb-8">
        <div className="h-64 w-full relative">
          <img
            src={team.backgroundImage || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80'}
            alt={`${team.name} background`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gaming-dark to-transparent" />
        </div>

        {/* Report Button */}
        {user && !isTeamMember && (
          <div className="absolute top-4 right-4">
            <ReportButton
              contentId={team.id}
              contentType="team"
              contentAuthorId={team.ownerId}
            />
          </div>
        )}

        {/* Team Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end justify-between gap-6">
            <div className="flex items-end gap-6">
              <img
                src={team.logo}
                alt={`${team.name} logo`}
                className="w-32 h-32 rounded-lg border-4 border-gaming-card relative z-10"
              />
              <div className="flex-1 relative z-10">
                <h1 className="text-4xl font-display font-bold text-white">
                  {team.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-300">
                  {team.country && (
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      <span>{team.country}</span>
                    </div>
                  )}
                  {team.region && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{team.region}</span>
                    </div>
                  )}
                  {team.timezone && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{team.timezone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 relative z-10">
              {isTeamOwner ? (
                <>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-3 py-1.5 text-sm bg-gaming-neon/10 text-gaming-neon rounded-md hover:bg-gaming-neon/20 transition-colors flex items-center gap-1"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="px-3 py-1.5 text-sm bg-gaming-neon/10 text-gaming-neon rounded-md hover:bg-gaming-neon/20 transition-colors flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Invite
                  </button>
                  <button
                    onClick={() => setShowRequestsModal(true)}
                    className="px-3 py-1.5 text-sm bg-gaming-neon/10 text-gaming-neon rounded-md hover:bg-gaming-neon/20 transition-colors flex items-center gap-1"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Requests
                  </button>
                  <button
                    onClick={() => setShowTransferModal(true)}
                    className="px-3 py-1.5 text-sm bg-gaming-neon/10 text-gaming-neon rounded-md hover:bg-gaming-neon/20 transition-colors"
                  >
                    Transfer
                  </button>
                  <button
                    onClick={handleDeleteTeam}
                    className="px-3 py-1.5 text-sm bg-gaming-accent/10 text-gaming-accent rounded-md hover:bg-gaming-accent/20 transition-colors"
                  >
                    Delete
                  </button>
                </>
              ) : isTeamMember ? (
                <button
                  onClick={() => setShowMembersModal(true)}
                  className="px-3 py-1.5 text-sm bg-gaming-accent/10 text-gaming-accent rounded-md hover:bg-gaming-accent/20 transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Leave Team
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
                  <TeamFollowButton
                    teamId={team.id}
                    followers={team.followers}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gaming-neon/20 mb-6">
        <button
          onClick={() => setCurrentTab('overview')}
          className={`px-6 py-3 font-display font-medium transition-colors relative ${
            currentTab === 'overview'
              ? 'text-gaming-neon'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Overview
          {currentTab === 'overview' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gaming-neon" />
          )}
        </button>
        <button
          onClick={() => setCurrentTab('matches')}
          className={`px-6 py-3 font-display font-medium transition-colors relative ${
            currentTab === 'matches'
              ? 'text-gaming-neon'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Matches
          {currentTab === 'matches' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gaming-neon" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      {currentTab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-gaming-card rounded-lg p-6 border border-gaming-neon/20">
              <h2 className="font-display text-xl font-bold text-white mb-4">About</h2>
              <p className="text-gray-300">{team.description}</p>
            </div>

            {/* Games */}
            <div className="bg-gaming-card rounded-lg p-6 border border-gaming-neon/20">
              <h2 className="font-display text-xl font-bold text-white mb-4">Games</h2>
              <div className="grid gap-4">
                {team.games.map((game) => (
                  <div
                    key={game.id}
                    className="p-4 rounded-lg bg-gaming-dark/50"
                  >
                    <h3 className="font-bold text-white mb-2">{game.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {game.platforms.map((platform) => (
                        <span
                          key={platform}
                          className="px-2 py-1 rounded-full bg-gaming-neon/10 text-gaming-neon text-xs"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-gaming-card rounded-lg p-6 border border-gaming-neon/20">
              <h2 className="font-display text-xl font-bold text-white mb-4">Statistics</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Win Rate</span>
                  <span className="text-white">
                    {Math.round((team.stats.wins / team.stats.matchesPlayed) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Tournament Wins</span>
                  <span className="text-white">{team.stats.tournamentWins}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Matches Played</span>
                  <span className="text-white">{team.stats.matchesPlayed}</span>
                </div>
              </div>
            </div>

            {/* Members */}
            <div className="bg-gaming-card rounded-lg p-6 border border-gaming-neon/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold text-white">Members</h2>
                {isTeamOwner && (
                  <button
                    onClick={() => setShowMembersModal(true)}
                    className="text-gaming-neon hover:text-gaming-neon/80"
                  >
                    Manage
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {team.members.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between p-3 rounded-lg bg-gaming-dark/50"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src="https://via.placeholder.com/32"
                        alt=""
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="text-white">User Name</div>
                        <div className="text-sm text-gaming-neon">{member.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <TeamMatchesList teamId={team.id} />
      )}

      {/* Modals */}
      {showEditModal && (
        <EditTeamModal
          team={team}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showMembersModal && (
        <ManageMembersModal
          team={team}
          onClose={() => setShowMembersModal(false)}
        />
      )}

      {showRequestsModal && (
        <JoinRequestsModal
          team={team}
          onClose={() => setShowRequestsModal(false)}
        />
      )}

      {showInviteModal && (
        <InviteMembersModal
          team={team}
          onClose={() => setShowInviteModal(false)}
        />
      )}

      {showTransferModal && (
        <TransferOwnershipModal
          team={team}
          onClose={() => setShowTransferModal(false)}
        />
      )}

      {showChallengeModal && (
        <TeamChallengeModal
          targetTeam={team}
          onClose={() => setShowChallengeModal(false)}
        />
      )}
    </div>
  );
}