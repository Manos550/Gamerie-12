import { collection, addDoc, updateDoc, doc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { useAuthStore } from './store';
import { toast } from 'react-toastify';
import { NewsPost } from '../types';

// Demo mode helper
const isDemoMode = import.meta.env.MODE === 'development';

// In-memory store for demo mode
let demoPosts: NewsPost[] = [];

const demoStorage = {
  uploadFile: async (file: File): Promise<string> => {
    return URL.createObjectURL(file);
  }
};

export const createNewsPost = async (data: {
  title: string;
  content: string;
  tags?: string[];
  media?: File[];
}): Promise<void> => {
  const user = useAuthStore.getState().user;
  if (!user) throw new Error('Must be logged in to create posts');

  try {
    let mediaUrls: { type: 'image' | 'video'; url: string }[] = [];

    if (isDemoMode) {
      mediaUrls = await Promise.all(
        (data.media || []).map(async (file) => ({
          type: file.type.startsWith('image/') ? 'image' : 'video',
          url: await demoStorage.uploadFile(file)
        }))
      );

      const newPost: NewsPost = {
        id: crypto.randomUUID(),
        authorId: user.id,
        authorName: user.username,
        authorImage: user.profileImage,
        title: data.title,
        content: data.content,
        tags: data.tags || [],
        media: mediaUrls,
        likes: [],
        saves: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      demoPosts.unshift(newPost);
      return;
    }

    // Upload media files
    mediaUrls = await Promise.all(
      (data.media || []).map(async (file) => {
        const fileRef = ref(storage, `news/${crypto.randomUUID()}`);
        await uploadBytes(fileRef, file);
        return {
          type: file.type.startsWith('image/') ? 'image' : 'video',
          url: await getDownloadURL(fileRef)
        };
      })
    );

    // Create post
    await addDoc(collection(db, 'news'), {
      authorId: user.id,
      authorName: user.username,
      authorImage: user.profileImage,
      title: data.title,
      content: data.content,
      tags: data.tags || [],
      media: mediaUrls,
      likes: [],
      saves: [],
      comments: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    toast.success('Post created successfully');
  } catch (error) {
    console.error('Error creating post:', error);
    toast.error('Failed to create post');
    throw error;
  }
};

export const likePost = async (postId: string, like: boolean): Promise<void> => {
  const user = useAuthStore.getState().user;
  if (!user) throw new Error('Must be logged in to like posts');

  try {
    if (isDemoMode) {
      const post = demoPosts.find(p => p.id === postId);
      if (post) {
        if (like) {
          post.likes.push(user.id);
        } else {
          post.likes = post.likes.filter(id => id !== user.id);
        }
      }
      return;
    }

    const postRef = doc(db, 'news', postId);
    await updateDoc(postRef, {
      likes: like ? arrayUnion(user.id) : arrayRemove(user.id)
    });
  } catch (error) {
    console.error('Error updating like:', error);
    toast.error('Failed to update like');
    throw error;
  }
};

export const savePost = async (postId: string, save: boolean): Promise<void> => {
  const user = useAuthStore.getState().user;
  if (!user) throw new Error('Must be logged in to save posts');

  try {
    if (isDemoMode) {
      const post = demoPosts.find(p => p.id === postId);
      if (post) {
        if (save) {
          post.saves.push(user.id);
        } else {
          post.saves = post.saves.filter(id => id !== user.id);
        }
      }
      return;
    }

    const postRef = doc(db, 'news', postId);
    await updateDoc(postRef, {
      saves: save ? arrayUnion(user.id) : arrayRemove(user.id)
    });
  } catch (error) {
    console.error('Error updating save:', error);
    toast.error('Failed to update save');
    throw error;
  }
};

// Helper function to get demo posts
export const getDemoPosts = () => demoPosts;