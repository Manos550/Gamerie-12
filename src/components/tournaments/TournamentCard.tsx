import React from 'react';
import { Tournament } from '../../types';
import { Calendar, Trophy, Users, Globe, Clock, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface TournamentCardProps {
  tournament: Tournament;
}

export default function TournamentCard({ tournament }: TournamentCardProps) {
  const isRegistrationOpen = new Date() < tournament.registrationDeadline;

  return (
    <div className="bg-gaming-card rounded-lg border border-gaming-neon/20 overflow-hidden">
      {/* Tournament Image */}
      <div className="h-48 relative">
        <img
          src={tournament.image}
          alt={tournament.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gaming-card to-transparent" />
        
        {/* Platform Badge */}
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gaming-dark/80 text-white text-sm">
          {tournament.platform}
        </div>
        
        {/* Registration Status */}
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm ${
          isRegistrationOpen 
            ? 'bg-gaming-neon/80 text-black' 
            : 'bg-gaming-accent/80 text-white'
        }`}>
          {isRegistrationOpen ? 'Registration Open' : 'Registration Closed'}
        </div>
      </div>

      {/* Tournament Info */}
      <div className="p-6">
        <h3 className="font-display text-xl font-bold text-white mb-2">
          {tournament.name}
        </h3>
        
        <p className="text-gray-400 mb-4">{tournament.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="w-4 h-4 text-gaming-neon" />
            <span className="text-white">{tournament.prizePool}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-gaming-neon" />
            <span className="text-white">
              {tournament.currentTeams}/{tournament.maxTeams} Teams
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Globe className="w-4 h-4 text-gaming-neon" />
            <span className="text-white">{tournament.region}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gaming-neon" />
            <span className="text-white">{tournament.format}</span>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gaming-neon" />
            <span className="text-gray-400">Starts:</span>
            <span className="text-white">
              {format(tournament.startDate, 'MMM d, yyyy')}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gaming-neon" />
            <span className="text-gray-400">Registration Deadline:</span>
            <span className="text-white">
              {format(tournament.registrationDeadline, 'MMM d, yyyy')}
            </span>
          </div>
        </div>

        <a
          href={tournament.platformUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gaming-neon text-black rounded-md hover:bg-gaming-neon/90 transition-colors"
        >
          <span>Register on {tournament.platform}</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}