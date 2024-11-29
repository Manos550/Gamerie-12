import { collection, addDoc, doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { useAuthStore } from './store';
import { toast } from 'react-toastify';
import { Post } from '../types';

// Demo mode helper
const isDemoMode = import.meta.env.MODE === 'development';

// In-memory store for demo mode
let demoPosts: Post[] = [
  // Manos550's posts
  {
    id: 'post-1',
    authorId: 'user-1',
    authorName: 'Manos550',
    authorImage: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=200',
    content: 'Just hit Immortal rank in Valorant! The grind was real but totally worth it. Thanks to my amazing team for the support! 🎮🏆',
    media: ['https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80'],
    likes: ['user-2', 'user-3', 'user-4'],
    comments: [
      {
        id: 'comment-1',
        authorId: 'user-2',
        authorName: 'NightStalker',
        authorImage: 'https://images.unsplash.com/photo-1566411520896-01e7ca4726af?auto=format&fit=crop&q=80&w=200',
        content: 'Congrats man! Well deserved! 🎉',
        likes: [],
        createdAt: new Date('2024-02-10T15:30:00')
      }
    ],
    createdAt: new Date('2024-02-10T15:00:00'),
    updatedAt: new Date('2024-02-10T15:00:00')
  },
  // NightStalker's posts
  {
    id: 'post-2',
    authorId: 'user-2',
    authorName: 'NightStalker',
    authorImage: 'https://images.unsplash.com/photo-1566411520896-01e7ca4726af?auto=format&fit=crop&q=80&w=200',
    content: 'New streaming setup is finally complete! Ready for some epic League of Legends action. Come hang out at twitch.tv/nightstalker 🎥',
    media: ['https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80'],
    likes: ['user-1', 'user-5'],
    comments: [],
    createdAt: new Date('2024-02-09T18:00:00'),
    updatedAt: new Date('2024-02-09T18:00:00')
  },
  // SakuraPro's posts
  {
    id: 'post-3',
    authorId: 'user-3',
    authorName: 'SakuraPro',
    authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    content: 'Another tournament victory with the team! 🏆 The coordination and teamwork were on point today. GGs to all competitors!',
    media: [],
    likes: ['user-1', 'user-2', 'user-4', 'user-5'],
    comments: [
      {
        id: 'comment-2',
        authorId: 'user-5',
        authorName: 'PixelQueen',
        authorImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
        content: 'Amazing plays today! That last match was intense!',
        likes: ['user-3'],
        createdAt: new Date('2024-02-08T20:15:00')
      }
    ],
    createdAt: new Date('2024-02-08T20:00:00'),
    updatedAt: new Date('2024-02-08T20:00:00')
  },
  // ArcticWolf's posts
  {
    id: 'post-4',
    authorId: 'user-4',
    authorName: 'ArcticWolf',
    authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    content: 'Looking for a CS2 coach to help improve my gameplay. Currently Global Elite but want to take it to the next level. DM if interested! 🎯',
    media: [],
    likes: ['user-1'],
    comments: [],
    createdAt: new Date('2024-02-07T14:00:00'),
    updatedAt: new Date('2024-02-07T14:00:00')
  },
  // PixelQueen's posts
  {
    id: 'post-5',
    authorId: 'user-5',
    authorName: 'PixelQueen',
    authorImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    content: 'New YouTube video is up! Check out my latest Valorant guide on advanced movement techniques. Link in bio! 🎮✨',
    media: ['https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80'],
    likes: ['user-1', 'user-2', 'user-3'],
    comments: [
      {
        id: 'comment-3',
        authorId: 'user-4',
        authorName: 'ArcticWolf',
        authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        content: 'Great tips! Really helped improve my gameplay.',
        likes: ['user-5'],
        createdAt: new Date('2024-02-06T16:30:00')
      }
    ],
    createdAt: new Date('2024-02-06T16:00:00'),
    updatedAt: new Date('2024-02-06T16:00:00')
  }
];

const demoStorage = {
  uploadFile: async (file: File): Promise<string> => {
    return URL.createObjectURL(file);
  }
};

export const createPost = async (content: string, mediaFiles: File[] = []): Promise<void> => {
  const user = useAuthStore.getState().user;
  if (!user) throw new Error('User must be logged in to create a post');

  try {
    let mediaUrls: string[] = [];

    if (isDemoMode) {
      mediaUrls = await Promise.all(
        mediaFiles.map(file => demoStorage.uploadFile(file))
      );

      const newPost: Post = {
        id: crypto.randomUUID(),
        authorId: user.id,
        authorName: user.username,
        authorImage: user.profileImage,
        content,
        media: mediaUrls,
        likes: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      demoPosts.unshift(newPost);
    } else {
      mediaUrls = await Promise.all(
        mediaFiles.map(async (file) => {
          const fileRef = ref(storage, `posts/${crypto.randomUUID()}`);
          await uploadBytes(fileRef, file);
          return getDownloadURL(fileRef);
        })
      );

      await addDoc(collection(db, 'posts'), {
        authorId: user.id,
        authorName: user.username,
        authorImage: user.profileImage,
        content,
        media: mediaUrls,
        likes: [],
        comments: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    toast.success('Post created successfully');
  } catch (error) {
    toast.error('Failed to create post');
    throw error;
  }
};

export const likePost = async (postId: string): Promise<void> => {
  const user = useAuthStore.getState().user;
  if (!user) throw new Error('User must be logged in to like a post');

  try {
    if (isDemoMode) {
      const post = demoPosts.find(p => p.id === postId);
      if (post && !post.likes.includes(user.id)) {
        post.likes.push(user.id);
      }
    } else {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        likes: arrayUnion(user.id)
      });
    }
  } catch (error) {
    toast.error('Failed to like post');
    throw error;
  }
};

export const unlikePost = async (postId: string): Promise<void> => {
  const user = useAuthStore.getState().user;
  if (!user) throw new Error('User must be logged in to unlike a post');

  try {
    if (isDemoMode) {
      const post = demoPosts.find(p => p.id === postId);
      if (post) {
        post.likes = post.likes.filter(id => id !== user.id);
      }
    } else {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        likes: arrayRemove(user.id)
      });
    }
  } catch (error) {
    toast.error('Failed to unlike post');
    throw error;
  }
};

export const addComment = async (postId: string, content: string): Promise<void> => {
  const user = useAuthStore.getState().user;
  if (!user) throw new Error('User must be logged in to comment');

  try {
    const comment = {
      id: crypto.randomUUID(),
      authorId: user.id,
      authorName: user.username,
      authorImage: user.profileImage,
      content,
      likes: [],
      createdAt: new Date()
    };

    if (isDemoMode) {
      const post = demoPosts.find(p => p.id === postId);
      if (post) {
        post.comments.push(comment);
      }
    } else {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        comments: arrayUnion(comment)
      });
    }
  } catch (error) {
    toast.error('Failed to add comment');
    throw error;
  }
};

// Helper function to get demo posts
export const getDemoPosts = () => demoPosts;