import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getUserEvents } from '../../lib/events';
import { useAuthStore } from '../../lib/store';
import EventCard from './EventCard';
import CreateEventModal from './CreateEventModal';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorDisplay from '../shared/ErrorDisplay';

export default function Calendar() {
  const { user } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: events, isLoading, error } = useQuery({
    queryKey: ['user-events', user?.id],
    queryFn: () => getUserEvents(user?.id || ''),
    enabled: !!user
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const selectedDateEvents = events?.filter(event => 
    isSameDay(new Date(event.startTime), selectedDate)
  ) || [];

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-display font-bold text-white">Calendar</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gaming-neon text-black rounded-md hover:bg-gaming-neon/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <div className="bg-gaming-card rounded-lg border border-gaming-neon/20 p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gaming-dark/50 rounded-full"
              >
                <ChevronLeft className="w-5 h-5 text-gaming-neon" />
              </button>
              <h2 className="text-xl font-display font-bold text-white">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gaming-dark/50 rounded-full"
              >
                <ChevronRight className="w-5 h-5 text-gaming-neon" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-400 py-2"
                >
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {daysInMonth.map((date) => {
                const dayEvents = events?.filter(event => 
                  isSameDay(new Date(event.startTime), date)
                ) || [];

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      aspect-square p-2 rounded-lg relative
                      ${isSameMonth(date, currentDate) ? 'text-white' : 'text-gray-600'}
                      ${isSameDay(date, selectedDate) ? 'bg-gaming-neon text-black' : 'hover:bg-gaming-dark/50'}
                    `}
                  >
                    <span className="text-sm">{format(date, 'd')}</span>
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                        {dayEvents.slice(0, 3).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 h-1 rounded-full ${
                              isSameDay(date, selectedDate) ? 'bg-black' : 'bg-gaming-neon'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-6">
          <div className="bg-gaming-card rounded-lg border border-gaming-neon/20 p-6">
            <h2 className="font-display text-xl font-bold text-white mb-4">
              Events for {format(selectedDate, 'MMMM d, yyyy')}
            </h2>

            <div className="space-y-4">
              {selectedDateEvents.length === 0 ? (
                <p className="text-center py-4 text-gray-400">
                  No events scheduled for this day
                </p>
              ) : (
                selectedDateEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateEventModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}