import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import Header from './components/layout/Header';
import AuthForm from './components/auth/AuthForm';
import ResetPassword from './components/auth/ResetPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';
import UserProfile from './components/profile/UserProfile';
import NewsFeed from './components/feed/NewsFeed';
import TeamsList from './components/teams/TeamsList';
import TeamCreate from './components/teams/TeamCreate';
import TeamProfile from './components/teams/TeamProfile';
import GamePage from './components/games/GamePage';
import NotificationsPage from './components/notifications/NotificationsPage';
import UsersList from './components/users/UsersList';
import GamesList from './components/games/GamesList';
import Calendar from './components/calendar/Calendar';
import TournamentsList from './components/tournaments/TournamentsList';
import GameSearch from './components/search/GameSearch';
import AdminDashboard from './components/moderation/AdminDashboard';
import { isFirebaseInitialized } from './lib/firebase';
import { initializeAuth } from './lib/auth';
import 'react-toastify/dist/ReactToastify.css';

// Initialize Firebase Authentication listener only if Firebase is initialized
if (isFirebaseInitialized) {
  initializeAuth();
}

const queryClient = new QueryClient();

export default function App() {
  if (!isFirebaseInitialized) {
    return (
      <div className="min-h-screen bg-gaming-dark text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gaming-card p-8 rounded-lg border border-gaming-neon/20 text-center">
          <h1 className="text-2xl font-display font-bold mb-4">Welcome to Gamerie</h1>
          <p className="text-gray-400 mb-6">
            The application is running in demo mode. To enable full functionality, please configure Firebase credentials in your environment variables.
          </p>
          <div className="bg-gaming-dark/50 p-4 rounded-lg text-left">
            <p className="text-sm text-gaming-neon mb-2">Required Environment Variables:</p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>VITE_FIREBASE_API_KEY</li>
              <li>VITE_FIREBASE_AUTH_DOMAIN</li>
              <li>VITE_FIREBASE_PROJECT_ID</li>
              <li>VITE_FIREBASE_STORAGE_BUCKET</li>
              <li>VITE_FIREBASE_MESSAGING_SENDER_ID</li>
              <li>VITE_FIREBASE_APP_ID</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gaming-dark">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/login" element={<AuthForm mode="login" />} />
              <Route path="/register" element={<AuthForm mode="register" />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/profile/:userId" element={<UserProfile />} />
              <Route path="/games/:gameId" element={<GamePage />} />
              <Route path="/search" element={<GameSearch />} />
              <Route path="/admin" element={<AdminDashboard />} />
              
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <NewsFeed />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/teams"
                element={
                  <ProtectedRoute>
                    <TeamsList />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/teams/create"
                element={
                  <ProtectedRoute>
                    <TeamCreate />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/teams/:teamId"
                element={
                  <ProtectedRoute>
                    <TeamProfile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <UsersList />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/games"
                element={
                  <ProtectedRoute>
                    <GamesList />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <Calendar />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/tournaments"
                element={
                  <ProtectedRoute>
                    <TournamentsList />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}