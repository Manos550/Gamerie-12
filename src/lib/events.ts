import { GameEvent, EventType, EventStatus, Challenge } from '../types';
import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';

// Demo events data
const demoEvents: GameEvent[] = [
  {
    id: 'event-1',
    type: 'match',
    title: 'League Match vs Team Alpha',
    description: 'Important league match against Team Alpha',
    startTime: new Date(Date.now() + 86400000), // Tomorrow
    endTime: new Date(Date.now() + 90000000),
    game: 'League of Legends',
    team: 'team-1',
    participants: ['user-1', 'user-2', 'user-3'],
    location: 'Online',
    status: 'upcoming',
    reminders: [
      {
        userId: 'user-1',
        time: new Date(Date.now() + 82800000), // 1 hour before
        notified: false
      }
    ],
    createdBy: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const createEvent = async (eventData: Partial<GameEvent>): Promise<void> => {
  try {
    if (import.meta.env.MODE === 'development') {
      // Add to demo events
      const newEvent: GameEvent = {
        id: `event-${demoEvents.length + 1}`,
        ...eventData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as GameEvent;
      demoEvents.push(newEvent);
      return;
    }

    await addDoc(collection(db, 'events'), {
      ...eventData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    toast.success('Event created successfully');
  } catch (error) {
    console.error('Error creating event:', error);
    toast.error('Failed to create event');
    throw error;
  }
};

export const createEventFromChallenge = async (challenge: Challenge): Promise<void> => {
  const eventData: Partial<GameEvent> = {
    type: 'match',
    title: challenge.type === 'user' 
      ? `${challenge.challengerName} vs ${challenge.challengedName}`
      : `${challenge.challengerTeamName} vs ${challenge.challengedTeamName}`,
    description: `Challenge Match - ${challenge.game}\n${challenge.message || ''}`,
    startTime: challenge.scheduledDate,
    endTime: new Date(challenge.scheduledDate.getTime() + 3600000), // 1 hour duration
    game: challenge.game,
    participants: challenge.type === 'user'
      ? [challenge.challengerId!, challenge.challengedId!]
      : [],
    team: challenge.type === 'team' ? challenge.challengerTeamId : undefined,
    location: 'Online Match',
    status: 'upcoming',
    reminders: [],
    createdBy: challenge.type === 'user' ? challenge.challengerId! : challenge.initiatedBy!
  };

  await createEvent(eventData);
};

export const updateEvent = async (eventId: string, updates: Partial<GameEvent>): Promise<void> => {
  try {
    if (import.meta.env.MODE === 'development') {
      const eventIndex = demoEvents.findIndex(e => e.id === eventId);
      if (eventIndex !== -1) {
        demoEvents[eventIndex] = {
          ...demoEvents[eventIndex],
          ...updates,
          updatedAt: new Date()
        };
      }
      return;
    }

    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    toast.success('Event updated successfully');
  } catch (error) {
    console.error('Error updating event:', error);
    toast.error('Failed to update event');
    throw error;
  }
};

export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    if (import.meta.env.MODE === 'development') {
      const eventIndex = demoEvents.findIndex(e => e.id === eventId);
      if (eventIndex !== -1) {
        demoEvents.splice(eventIndex, 1);
      }
      return;
    }

    await deleteDoc(doc(db, 'events', eventId));
    toast.success('Event deleted successfully');
  } catch (error) {
    console.error('Error deleting event:', error);
    toast.error('Failed to delete event');
    throw error;
  }
};

export const addReminder = async (eventId: string, userId: string, time: Date): Promise<void> => {
  try {
    if (import.meta.env.MODE === 'development') {
      const event = demoEvents.find(e => e.id === eventId);
      if (event) {
        event.reminders.push({
          userId,
          time,
          notified: false
        });
      }
      return;
    }

    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      reminders: arrayUnion({
        userId,
        time,
        notified: false
      })
    });

    toast.success('Reminder set successfully');
  } catch (error) {
    console.error('Error setting reminder:', error);
    toast.error('Failed to set reminder');
    throw error;
  }
};

export const getUserEvents = async (userId: string): Promise<GameEvent[]> => {
  if (import.meta.env.MODE === 'development') {
    return demoEvents.filter(event => 
      event.participants.includes(userId) || 
      event.createdBy === userId
    );
  }

  // Implement Firebase query for user events
  return [];
};

export const getTeamEvents = async (teamId: string): Promise<GameEvent[]> => {
  if (import.meta.env.MODE === 'development') {
    return demoEvents.filter(event => event.team === teamId);
  }

  // Implement Firebase query for team events
  return [];
};

export const getEventsByChallenge = async (challengeId: string): Promise<GameEvent[]> => {
  if (import.meta.env.MODE === 'development') {
    return demoEvents.filter(event => event.challengeId === challengeId);
  }

  // Implement Firebase query for challenge events
  return [];
};