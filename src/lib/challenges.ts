import { collection, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Challenge, ChallengeStatus, ChallengeType } from '../types';
import { createEvent } from './events';
import { toast } from 'react-toastify';

// Demo mode helper
const isDemoMode = import.meta.env.MODE === 'development';

// In-memory store for demo mode
let demoChallenges: Challenge[] = [
  // User vs User matches
  {
    id: 'challenge-1',
    type: 'user',
    challengerId: 'user-1',
    challengerName: 'Manos550',
    challengedId: 'user-2',
    challengedName: 'NightStalker',
    game: 'League of Legends',
    scheduledDate: new Date('2024-02-15T18:00:00'),
    format: 'Best of 3',
    stakes: 'Community Bragging Rights',
    status: 'completed',
    result: {
      winnerId: 'user-1',
      score: '2-1',
      notes: 'Epic comeback in the final game!'
    },
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-15')
  },
  {
    id: 'challenge-2',
    type: 'user',
    challengerId: 'user-3',
    challengerName: 'SakuraPro',
    challengedId: 'user-1',
    challengedName: 'Manos550',
    game: 'Valorant',
    scheduledDate: new Date('2024-02-20T20:00:00'),
    format: 'Best of 1',
    status: 'pending',
    createdAt: new Date('2024-02-12'),
    updatedAt: new Date('2024-02-12')
  },
  // Team vs Team matches
  {
    id: 'challenge-3',
    type: 'team',
    challengerTeamId: 'gameriebest',
    challengerTeamName: 'GamerieBest',
    challengedTeamId: 'shadow-stalkers',
    challengedTeamName: 'Shadow Stalkers',
    game: 'Counter-Strike 2',
    scheduledDate: new Date('2024-02-18T19:00:00'),
    format: 'Best of 3',
    teamSize: 5,
    stakes: '$500 Prize Pool',
    status: 'accepted',
    initiatedBy: 'user-1',
    createdAt: new Date('2024-02-11'),
    updatedAt: new Date('2024-02-11')
  },
  {
    id: 'challenge-4',
    type: 'team',
    challengerTeamId: 'shadow-stalkers',
    challengerTeamName: 'Shadow Stalkers',
    challengedTeamId: 'gameriebest',
    challengedTeamName: 'GamerieBest',
    game: 'Valorant',
    scheduledDate: new Date('2024-02-01T20:00:00'),
    format: 'Best of 5',
    teamSize: 5,
    stakes: 'Tournament Qualification',
    status: 'completed',
    result: {
      winnerId: 'shadow-stalkers',
      score: '3-2',
      notes: 'Intense series that went to the final map!'
    },
    initiatedBy: 'user-2',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-02-01')
  },
  // More recent matches
  {
    id: 'challenge-5',
    type: 'user',
    challengerId: 'user-4',
    challengerName: 'ArcticWolf',
    challengedId: 'user-5',
    challengedName: 'PixelQueen',
    game: 'Counter-Strike 2',
    scheduledDate: new Date('2024-02-25T21:00:00'),
    format: 'Best of 1',
    stakes: 'Friendly Match',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'challenge-6',
    type: 'team',
    challengerTeamId: 'gameriebest',
    challengerTeamName: 'GamerieBest',
    challengedTeamId: 'shadow-stalkers',
    challengedTeamName: 'Shadow Stalkers',
    game: 'League of Legends',
    scheduledDate: new Date('2024-03-01T19:00:00'),
    format: 'Best of 3',
    teamSize: 5,
    stakes: 'Community Tournament Semi-Finals',
    status: 'accepted',
    initiatedBy: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const createChallenge = async (challenge: Partial<Challenge>): Promise<void> => {
  try {
    if (isDemoMode) {
      const newChallenge: Challenge = {
        id: `challenge-${Date.now()}`,
        ...challenge,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      } as Challenge;
      
      demoChallenges.push(newChallenge);

      // Create calendar event for the challenge
      await createEvent({
        type: 'match',
        title: `${challenge.type === 'user' ? 
          `${challenge.challengerName} vs ${challenge.challengedName}` :
          `${challenge.challengerTeamName} vs ${challenge.challengedTeamName}`}`,
        description: `Challenge Match - ${challenge.game}\n${challenge.message || ''}`,
        startTime: challenge.scheduledDate!,
        endTime: new Date(challenge.scheduledDate!.getTime() + 3600000), // 1 hour duration
        game: challenge.game!,
        participants: challenge.type === 'user' ? 
          [challenge.challengerId!, challenge.challengedId!] :
          [], // For team challenges, participants would be added when accepted
        status: 'upcoming',
        location: 'Online Match',
        createdBy: challenge.type === 'user' ? challenge.challengerId! : challenge.initiatedBy!
      });

      toast.success('Challenge sent successfully');
      return;
    }

    const challengeDoc = await addDoc(collection(db, 'challenges'), {
      ...challenge,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Create calendar event for the challenge
    await createEvent({
      type: 'match',
      title: `${challenge.type === 'user' ? 
        `${challenge.challengerName} vs ${challenge.challengedName}` :
        `${challenge.challengerTeamName} vs ${challenge.challengedTeamName}`}`,
      description: `Challenge Match - ${challenge.game}\n${challenge.message || ''}`,
      startTime: challenge.scheduledDate!,
      endTime: new Date(challenge.scheduledDate!.getTime() + 3600000), // 1 hour duration
      game: challenge.game!,
      participants: challenge.type === 'user' ? 
        [challenge.challengerId!, challenge.challengedId!] :
        [], // For team challenges, participants would be added when accepted
      status: 'upcoming',
      location: 'Online Match',
      createdBy: challenge.type === 'user' ? challenge.challengerId! : challenge.initiatedBy!
    });

    toast.success('Challenge sent successfully');
  } catch (error) {
    console.error('Error creating challenge:', error);
    toast.error('Failed to send challenge');
    throw error;
  }
};

export const updateChallengeStatus = async (
  challengeId: string, 
  status: ChallengeStatus,
  result?: { winnerId: string; score: string; notes?: string }
): Promise<void> => {
  try {
    if (isDemoMode) {
      const challenge = demoChallenges.find(c => c.id === challengeId);
      if (challenge) {
        challenge.status = status;
        challenge.result = result;
        challenge.updatedAt = new Date();
      }
      toast.success(`Challenge ${status}`);
      return;
    }

    const challengeRef = doc(db, 'challenges', challengeId);
    await updateDoc(challengeRef, {
      status,
      ...(result && { result }),
      updatedAt: serverTimestamp()
    });

    toast.success(`Challenge ${status}`);
  } catch (error) {
    console.error('Error updating challenge:', error);
    toast.error('Failed to update challenge');
    throw error;
  }
};

export const deleteChallenge = async (challengeId: string): Promise<void> => {
  try {
    if (isDemoMode) {
      demoChallenges = demoChallenges.filter(c => c.id !== challengeId);
      toast.success('Challenge deleted');
      return;
    }

    await deleteDoc(doc(db, 'challenges', challengeId));
    toast.success('Challenge deleted');
  } catch (error) {
    console.error('Error deleting challenge:', error);
    toast.error('Failed to delete challenge');
    throw error;
  }
};

export const getChallenges = (
  type: ChallengeType,
  entityId: string
): Challenge[] => {
  if (isDemoMode) {
    if (type === '') {
      // Return all challenges for admin panel
      return demoChallenges;
    }
    return demoChallenges.filter(c => 
      (type === 'user' && (c.challengerId === entityId || c.challengedId === entityId)) ||
      (type === 'team' && (c.challengerTeamId === entityId || c.challengedTeamId === entityId))
    );
  }
  
  return [];
};