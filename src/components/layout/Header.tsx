import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from '../../lib/auth';
import { Bell, Search, Users, Calendar, LogOut, Gamepad, User, UserPlus, Trophy, X } from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { search } from '../../lib/search';
import { useDebounce } from '../../hooks/useDebounce';

export default function Header() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState({ users: [], teams: [], games: [] });
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchTerm) {
        setIsSearching(true);
        const results = await search(debouncedSearchTerm);
        setSearchResults(results);
        setShowResults(true);
        setIsSearching(false);
      } else {
        setSearchResults({ users: [], teams: [], games: [] });
        setShowResults(false);
      }
    };

    performSearch();
  }, [debouncedSearchTerm]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = searchResults.games.length + searchResults.teams.length + searchResults.users.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % totalItems);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      let currentIndex = 0;
      
      // Navigate to games
      for (const game of searchResults.games) {
        if (currentIndex === selectedIndex) {
          navigate(`/games/${game.id}`);
          setShowResults(false);
          setSearchTerm('');
          return;
        }
        currentIndex++;
      }
      
      // Navigate to teams
      for (const team of searchResults.teams) {
        if (currentIndex === selectedIndex) {
          navigate(`/teams/${team.id}`);
          setShowResults(false);
          setSearchTerm('');
          return;
        }
        currentIndex++;
      }
      
      // Navigate to users
      for (const user of searchResults.users) {
        if (currentIndex === selectedIndex) {
          navigate(`/profile/${user.id}`);
          setShowResults(false);
          setSearchTerm('');
          return;
        }
        currentIndex++;
      }
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setShowResults(false);
    setSelectedIndex(-1);
  };

  return (
    <header className="bg-gaming-card border-b border-gaming-neon/20 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <Gamepad className="w-8 h-8 text-gaming-neon group-hover:animate-glow" />
              <span className="font-display font-bold text-xl text-white group-hover:text-gaming-neon transition-colors">
                GAMERIE
              </span>
            </Link>
          </div>

          <div className="flex-1 max-w-lg mx-8 relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
              <input
                type="text"
                placeholder="Search games, teams, or players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowResults(true)}
                onKeyDown={handleKeyDown}
                className="w-full pl-9 pr-10 py-2 rounded-full bg-gaming-dark/50 text-white placeholder-white/50 border border-gaming-neon/20 focus:border-gaming-neon focus:outline-none focus:ring-1 focus:ring-gaming-neon transition-all text-sm"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gaming-card rounded-lg border border-gaming-neon/20 shadow-lg overflow-hidden">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-400">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-gaming-neon border-t-transparent mx-auto"></div>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {/* Games Section */}
                    {searchResults.games.length > 0 && (
                      <div className="p-2">
                        <h3 className="text-xs font-medium text-gray-400 px-3 py-2">Games</h3>
                        {searchResults.games.map((game, index) => (
                          <Link
                            key={game.id}
                            to={`/games/${game.id}`}
                            className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gaming-dark/50 transition-colors ${
                              selectedIndex === index ? 'bg-gaming-dark/50' : ''
                            }`}
                            onClick={() => {
                              setShowResults(false);
                              setSearchTerm('');
                            }}
                          >
                            <img
                              src={game.wallPhoto}
                              alt={game.name}
                              className="w-8 h-8 rounded object-cover"
                            />
                            <div>
                              <div className="text-white font-medium">{game.name}</div>
                              <div className="text-xs text-gray-400">{game.gameType}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Teams Section */}
                    {searchResults.teams.length > 0 && (
                      <div className="p-2 border-t border-gaming-neon/10">
                        <h3 className="text-xs font-medium text-gray-400 px-3 py-2">Teams</h3>
                        {searchResults.teams.map((team, index) => (
                          <Link
                            key={team.id}
                            to={`/teams/${team.id}`}
                            className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gaming-dark/50 transition-colors ${
                              selectedIndex === index + searchResults.games.length ? 'bg-gaming-dark/50' : ''
                            }`}
                            onClick={() => {
                              setShowResults(false);
                              setSearchTerm('');
                            }}
                          >
                            <img
                              src={team.logo}
                              alt={team.name}
                              className="w-8 h-8 rounded-lg"
                            />
                            <div>
                              <div className="text-white font-medium">{team.name}</div>
                              <div className="text-xs text-gray-400">{team.members.length} members</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Users Section */}
                    {searchResults.users.length > 0 && (
                      <div className="p-2 border-t border-gaming-neon/10">
                        <h3 className="text-xs font-medium text-gray-400 px-3 py-2">Players</h3>
                        {searchResults.users.map((user, index) => (
                          <Link
                            key={user.id}
                            to={`/profile/${user.id}`}
                            className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gaming-dark/50 transition-colors ${
                              selectedIndex === index + searchResults.games.length + searchResults.teams.length ? 'bg-gaming-dark/50' : ''
                            }`}
                            onClick={() => {
                              setShowResults(false);
                              setSearchTerm('');
                            }}
                          >
                            <img
                              src={user.profileImage}
                              alt={user.username}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <div className="text-white font-medium">{user.username}</div>
                              <div className="text-xs text-gray-400">{user.gamerTitle}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {searchResults.games.length === 0 && 
                     searchResults.teams.length === 0 && 
                     searchResults.users.length === 0 && (
                      <div className="p-4 text-center text-gray-400">
                        No results found
                      </div>
                    )}

                    {/* View All Results Link */}
                    {(searchResults.games.length > 0 || 
                      searchResults.teams.length > 0 || 
                      searchResults.users.length > 0) && (
                      <Link
                        to={`/search?q=${encodeURIComponent(searchTerm)}`}
                        className="block p-3 text-center text-gaming-neon hover:bg-gaming-dark/50 border-t border-gaming-neon/10"
                        onClick={() => {
                          setShowResults(false);
                          setSearchTerm('');
                        }}
                      >
                        View all results
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <nav className="flex items-center space-x-4">
            <Link 
              to="/users" 
              className="hover:text-gaming-neon transition-colors"
              title="Users"
            >
              <User className="w-6 h-6" />
            </Link>
            <Link 
              to="/teams" 
              className="hover:text-gaming-neon transition-colors"
              title="Teams"
            >
              <Users className="w-6 h-6" />
            </Link>
            <Link 
              to="/games" 
              className="hover:text-gaming-neon transition-colors"
              title="Games"
            >
              <Gamepad className="w-6 h-6" />
            </Link>
            <Link 
              to="/tournaments" 
              className="hover:text-gaming-neon transition-colors"
              title="Tournaments"
            >
              <Trophy className="w-6 h-6" />
            </Link>
            <Link 
              to="/calendar" 
              className="hover:text-gaming-neon transition-colors"
              title="Calendar"
            >
              <Calendar className="w-6 h-6" />
            </Link>
            <Link 
              to="/notifications" 
              className="hover:text-gaming-neon transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-gaming-accent text-xs rounded-full w-4 h-4 flex items-center justify-center">
                3
              </span>
            </Link>
            {user ? (
              <>
                <Link 
                  to={`/profile/${user.id}`}
                  className="hover:ring-2 hover:ring-gaming-neon transition-all"
                  title="Profile"
                >
                  <img
                    src={user.profileImage || 'https://via.placeholder.com/32'}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-gaming-neon/50"
                  />
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="hover:text-gaming-neon transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-white hover:text-gaming-neon transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-4 py-2 bg-gaming-neon text-black rounded-md hover:bg-gaming-neon/90 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}