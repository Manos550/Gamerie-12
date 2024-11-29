import React from 'react';
import { GameEvent } from '../../types';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Users, Bell } from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { addReminder } from '../../lib/events';

interface EventCardProps {
  event: GameEvent;
}

export default function EventCard({ event }: EventCardProps) {
  const { user } = useAuthStore();
  const hasReminder = user && event.reminders?.some(r => r.userId === user.id);

  const handleSetReminder = async () => {
    if (!user) return;

    // Set reminder for 1 hour before event
    const reminderTime = new Date(event.startTime);
    reminderTime.setHours(reminderTime.getHours() - 1);
    
    await addReminder(event.id, user.id, reminderTime);
  };

  return (
    <div className="bg-gaming-dark/50 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display font-bold text-white">{event.title}</h3>
          {event.description && (
            <p className="text-sm text-gray-400">{event.description}</p>
          )}
        </div>
        {!hasReminder && user && (
          <button
            onClick={handleSetReminder}
            className="p-2 hover:bg-gaming-dark rounded-full"
            title="Set Reminder"
          >
            <Bell className="w-4 h-4 text-gaming-neon" />
          </button>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gaming-neon" />
          <span className="text-gray-300">
            {format(new Date(event.startTime), 'MMM d, yyyy')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gaming-neon" />
          <span className="text-gray-300">
            {format(new Date(event.startTime), 'h:mm a')} - 
            {format(new Date(event.endTime), 'h:mm a')}
          </span>
        </div>

        {event.location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gaming-neon" />
            <span className="text-gray-300">{event.location}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gaming-neon" />
          <span className="text-gray-300">
            {event.participants?.length || 0} participants
          </span>
        </div>
      </div>

      {hasReminder && (
        <div className="flex items-center gap-2 text-sm text-gaming-neon">
          <Bell className="w-4 h-4" />
          <span>Reminder set</span>
        </div>
      )}
    </div>
  );
}