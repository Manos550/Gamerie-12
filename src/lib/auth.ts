import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useAuthStore } from './store';
import { User, UserRole } from '../types';
import { toast } from 'react-toastify';
import { demoUsers } from './demo-data';
import { initializePresence, updatePresence } from './presence';

// Demo mode helper
const isDemoMode = import.meta.env.MODE === 'development';

export const signUp = async (
  email: string,
  password: string,
  username: string,
  role: UserRole = 'user'
): Promise<User> => {
  try {
    if (isDemoMode) {
      return demoAuth.signUp(email, password, username, role);
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { uid } = userCredential.user;

    // Send email verification
    await sendEmailVerification(userCredential.user);

    const newUser: User = {
      id: uid,
      email,
      username,
      role,
      gamerTitle: 'Player',
      gameLevel: 'Amateur',
      profileImage: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&q=80&w=200',
      backgroundImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80',
      bio: 'New gamer ready for action!',
      personalInfo: {
        location: 'Gaming World'
      },
      gamesPlayed: [],
      platforms: ['PC'],
      socialMedia: [],
      gamingAccounts: [],
      needs: [],
      skills: [],
      teams: [],
      achievements: [],
      stats: {
        wins: 0,
        losses: 0,
        draws: 0,
        tournamentWins: 0,
        matchesPlayed: 0
      },
      followers: [],
      following: [],
      isOnline: true,
      lastSeen: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(db, 'users', uid), {
      ...newUser,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    initializePresence(uid);
    toast.success('Welcome to Gamerie! Please check your email for verification.');
    return newUser;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';
    toast.error(errorMessage);
    throw error;
  }
};

export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    if (isDemoMode) {
      return demoAuth.signIn(email);
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }

    if (!userCredential.user.emailVerified) {
      toast.warning('Please verify your email address');
    }

    const userData = userDoc.data() as User;
    useAuthStore.getState().setUser(userData);
    initializePresence(userData.id);
    toast.success('Welcome back to Gamerie!');
    return userData;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    toast.error(errorMessage);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    const user = useAuthStore.getState().user;
    if (user) {
      await updatePresence(user.id, false);
    }

    if (isDemoMode) {
      useAuthStore.getState().setUser(null);
      toast.success('Successfully logged out');
      return;
    }

    await firebaseSignOut(auth);
    useAuthStore.getState().setUser(null);
    toast.success('Successfully logged out');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Logout failed';
    toast.error(errorMessage);
    throw error;
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    if (isDemoMode) {
      toast.success('Password reset email sent (Demo Mode)');
      return;
    }

    await sendPasswordResetEmail(auth, email);
    toast.success('Password reset email sent. Please check your inbox.');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
    toast.error(errorMessage);
    throw error;
  }
};

export const initializeAuth = (): void => {
  if (isDemoMode) return;

  onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          useAuthStore.getState().setUser(userData);
          initializePresence(userData.id);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        useAuthStore.getState().setUser(null);
      }
    } else {
      useAuthStore.getState().setUser(null);
    }
  });
};

// Demo auth helpers
const demoAuth = {
  signUp: async (email: string, password: string, username: string, role: UserRole = 'user'): Promise<User> => {
    const newUser: User = {
      id: 'demo-user-' + Date.now(),
      email,
      username,
      role,
      gamerTitle: 'Player',
      gameLevel: 'Amateur',
      profileImage: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&q=80&w=200',
      backgroundImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80',
      bio: 'New gamer ready for action!',
      personalInfo: {
        location: 'Gaming World'
      },
      gamesPlayed: [],
      platforms: ['PC'],
      socialMedia: [],
      gamingAccounts: [],
      needs: [],
      skills: [],
      teams: [],
      achievements: [],
      stats: {
        wins: 0,
        losses: 0,
        draws: 0,
        tournamentWins: 0,
        matchesPlayed: 0
      },
      followers: [],
      following: [],
      isOnline: true,
      lastSeen: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    useAuthStore.getState().setUser(newUser);
    return newUser;
  },

  signIn: async (email: string): Promise<User> => {
    // Return the first demo user for testing
    const demoUser = demoUsers[0];
    useAuthStore.getState().setUser(demoUser);
    return demoUser;
  }
};