import { Team } from '../types';
import { doc, collection, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { toast } from 'react-toastify';

// Default images
export const DEFAULT_TEAM_LOGO = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=200';
export const DEFAULT_TEAM_BACKGROUND = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80';

// Demo teams data
const demoTeams: Team[] = [
  {
    id: 'gameriebest',
    name: 'GamerieBest',
    logo: DEFAULT_TEAM_LOGO,
    backgroundImage: DEFAULT_TEAM_BACKGROUND,
    description: 'Elite gaming team focused on competitive excellence and team synergy. Known for strategic gameplay and coordinated team tactics.',
    country: 'Greece',
    region: 'Europe',
    timezone: 'UTC+2',
    level: 'Pro',
    games: [
      {
        id: 'valorant',
        name: 'Valorant',
        platforms: ['PC']
      },
      {
        id: 'cs2',
        name: 'Counter-Strike 2',
        platforms: ['PC']
      }
    ],
    platforms: ['PC'],
    members: [
      {
        userId: 'user-1',
        role: 'owner',
        joinedAt: new Date('2023-05-01')
      },
      {
        userId: 'user-3',
        role: 'Member',
        joinedAt: new Date('2024-01-25')
      },
      {
        userId: 'user-5',
        role: 'Member',
        joinedAt: new Date('2024-01-25')
      }
    ],
    ownerId: 'user-1',
    stats: {
      wins: 75,
      losses: 25,
      draws: 2,
      tournamentWins: 3,
      matchesPlayed: 102,
      ranking: 5
    },
    followers: [],
    socialMedia: [
      {
        platform: 'Twitter',
        url: 'https://twitter.com/gameriebest'
      },
      {
        platform: 'Discord',
        url: 'https://discord.gg/gameriebest'
      },
      {
        platform: 'Twitch',
        url: 'https://twitch.tv/gameriebest'
      }
    ],
    teamMessage: 'Join us in our journey to gaming excellence!',
    createdAt: new Date('2023-05-01'),
    updatedAt: new Date()
  },
  {
    id: 'shadow-stalkers',
    name: 'Shadow Stalkers',
    logo: DEFAULT_TEAM_LOGO,
    backgroundImage: DEFAULT_TEAM_BACKGROUND,
    description: 'Elite League of Legends team focused on competitive excellence and team synergy. Regular tournament participants with a strong focus on strategic gameplay.',
    country: 'United Kingdom',
    region: 'Europe',
    timezone: 'UTC+0',
    level: 'Pro',
    games: [
      {
        id: 'lol',
        name: 'League of Legends',
        platforms: ['PC']
      },
      {
        id: 'valorant',
        name: 'Valorant',
        platforms: ['PC']
      }
    ],
    platforms: ['PC'],
    members: [
      {
        userId: 'user-2',
        role: 'owner',
        joinedAt: new Date('2023-07-01')
      },
      {
        userId: 'user-4',
        role: 'Member',
        joinedAt: new Date('2024-01-25')
      }
    ],
    ownerId: 'user-2',
    stats: {
      wins: 200,
      losses: 50,
      draws: 0,
      tournamentWins: 8,
      matchesPlayed: 250,
      ranking: 2
    },
    followers: [],
    socialMedia: [
      {
        platform: 'Twitter',
        url: 'https://twitter.com/shadowstalkers'
      },
      {
        platform: 'Discord',
        url: 'https://discord.gg/shadowstalkers'
      },
      {
        platform: 'Twitch',
        url: 'https://twitch.tv/shadowstalkers'
      }
    ],
    teamMessage: 'Seeking strategic players for tournament play',
    createdAt: new Date('2023-07-01'),
    updatedAt: new Date()
  }
];

export const getDemoTeams = () => demoTeams;

export const createTeam = async (teamData: Partial<Team>, files?: {
  logo?: File;
  background?: File;
  video?: File;
}) => {
  try {
    let logoUrl = DEFAULT_TEAM_LOGO;
    let backgroundUrl = DEFAULT_TEAM_BACKGROUND;
    let videoUrl = '';

    if (import.meta.env.MODE === 'development') {
      if (files?.logo) {
        logoUrl = URL.createObjectURL(files.logo);
      }
      if (files?.background) {
        backgroundUrl = URL.createObjectURL(files.background);
      }
      if (files?.video) {
        videoUrl = URL.createObjectURL(files.video);
      }

      const newTeam: Team = {
        id: `team-${Date.now()}`,
        ...teamData,
        logo: logoUrl,
        backgroundImage: backgroundUrl,
        backgroundVideo: videoUrl,
        followers: [],
        createdAt: new Date(),
        updatedAt: new Date()
      } as Team;

      demoTeams.push(newTeam);
      toast.success('Team created successfully');
      return newTeam;
    }

    // Upload files if provided
    if (files?.logo) {
      const logoRef = ref(storage, `teams/${Date.now()}-logo`);
      await uploadBytes(logoRef, files.logo);
      logoUrl = await getDownloadURL(logoRef);
    }

    if (files?.background) {
      const bgRef = ref(storage, `teams/${Date.now()}-background`);
      await uploadBytes(bgRef, files.background);
      backgroundUrl = await getDownloadURL(bgRef);
    }

    if (files?.video) {
      const videoRef = ref(storage, `teams/${Date.now()}-video`);
      await uploadBytes(videoRef, files.video);
      videoUrl = await getDownloadURL(videoRef);
    }

    const teamRef = await addDoc(collection(db, 'teams'), {
      ...teamData,
      logo: logoUrl,
      backgroundImage: backgroundUrl,
      backgroundVideo: videoUrl,
      followers: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    toast.success('Team created successfully');
    return { id: teamRef.id, ...teamData };
  } catch (error) {
    console.error('Error creating team:', error);
    toast.error('Failed to create team');
    throw error;
  }
};

export const updateTeam = async (teamId: string, updates: Partial<Team>) => {
  try {
    if (import.meta.env.MODE === 'development') {
      const teamIndex = demoTeams.findIndex(t => t.id === teamId);
      if (teamIndex !== -1) {
        demoTeams[teamIndex] = {
          ...demoTeams[teamIndex],
          ...updates,
          updatedAt: new Date()
        };
      }
      toast.success('Team updated successfully');
      return;
    }

    const teamRef = doc(db, 'teams', teamId);
    await updateDoc(teamRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    toast.success('Team updated successfully');
  } catch (error) {
    console.error('Error updating team:', error);
    toast.error('Failed to update team');
    throw error;
  }
};

export const deleteTeam = async (teamId: string) => {
  try {
    if (import.meta.env.MODE === 'development') {
      const teamIndex = demoTeams.findIndex(t => t.id === teamId);
      if (teamIndex !== -1) {
        demoTeams.splice(teamIndex, 1);
      }
      toast.success('Team deleted successfully');
      return;
    }

    await deleteDoc(doc(db, 'teams', teamId));
    toast.success('Team deleted successfully');
  } catch (error) {
    console.error('Error deleting team:', error);
    toast.error('Failed to delete team');
    throw error;
  }
};

export const leaveTeam = async (teamId: string) => {
  // Implementation for leaving a team
  toast.success('Left team successfully');
};

export const transferOwnership = async (teamId: string, newOwnerId: string) => {
  // Implementation for transferring team ownership
  toast.success('Team ownership transferred successfully');
};

export const sendTeamJoinRequest = async (teamId: string) => {
  // Implementation for sending join request
  toast.success('Join request sent successfully');
};

export const acceptJoinRequest = async (requestId: string) => {
  // Implementation for accepting join request
  toast.success('Join request accepted');
};

export const rejectJoinRequest = async (requestId: string) => {
  // Implementation for rejecting join request
  toast.success('Join request rejected');
};

export const inviteMember = async (teamId: string, inviteeId: string, message?: string) => {
  // Implementation for inviting a member
  toast.success('Invitation sent successfully');
};

export const updateMemberRole = async (teamId: string, userId: string, role: string) => {
  // Implementation for updating member role
  toast.success('Member role updated successfully');
};

export const removeMember = async (teamId: string, userId: string) => {
  // Implementation for removing a member
  toast.success('Member removed successfully');
};