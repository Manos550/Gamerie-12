import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Event } from '../../types';
import { format } from 'date-fns';
import { Calendar, MapPin } from 'lucide-react';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorDisplay from '../shared/ErrorDisplay';

interface UpcomingEventsProps {
  userId: string;
}

export default function UpcomingEvents({ userId }: UpcomingEventsProps) {
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['upcoming-events', userId],
    queryFn: async () => {
      const q = query(
        collection(db, 'events'),
        where('participants', 'array-contains', userId),
        where('startTime', '>=', new Date()),
        orderBy('startTime', 'asc'),
        limit(5)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Event[];
    }
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="bg-gaming-card rounded-lg border border-gaming-neon/20 overflow-hidden">
      <div className="p-6">
        <h2 className="font-display text-xl font-bold text-white mb-6">Upcoming Events</h2>
        
        <div className="space-y-4">
          {events?.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No upcoming events</p>
          ) : (
            events?.map((event) => (
              <div
                key={event.id}
                className="p-4 rounded-lg bg-gaming-dark/50 space-y-2"
              >
                <h3 className="font-display font-bold text-white">{event.title}</h3>
                <p className="text-sm text-gray-400">{event.description}</p>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-gaming-neon">
                    <Calendar className="w-4 h-4" />
                    <span>{format(event.startTime, 'MMM d, h:mm a')}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1 text-gaming-neon">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}