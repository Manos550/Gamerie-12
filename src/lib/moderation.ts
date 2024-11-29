import { collection, addDoc, updateDoc, doc, deleteDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Report, ReportStatus } from '../types';
import { toast } from 'react-toastify';

// Demo reports for development mode
let demoReports: Report[] = [];

// Demo official posts for development mode
let demoOfficialPosts: any[] = [];

export const createReport = async (data: {
  contentId: string;
  contentType: ReportType;
  contentAuthorId: string;
  reporterId: string;
  type: 'spam' | 'harassment' | 'inappropriate' | 'other';
  reason: string;
}) => {
  try {
    if (import.meta.env.MODE === 'development') {
      const newReport: Report = {
        id: `report-${Date.now()}`,
        ...data,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      demoReports.push(newReport);
      toast.success('Report submitted successfully');
      return;
    }

    await addDoc(collection(db, 'reports'), {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    toast.success('Report submitted successfully');
  } catch (error) {
    console.error('Error creating report:', error);
    toast.error('Failed to submit report');
    throw error;
  }
};

export const getReports = async (status?: ReportStatus): Promise<Report[]> => {
  if (import.meta.env.MODE === 'development') {
    return status ? demoReports.filter(r => r.status === status) : demoReports;
  }

  try {
    let q = query(collection(db, 'reports'));
    if (status) {
      q = query(q, where('status', '==', status));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

export const updateReportStatus = async (
  reportId: string,
  status: ReportStatus,
  notes?: string
): Promise<void> => {
  try {
    if (import.meta.env.MODE === 'development') {
      const report = demoReports.find(r => r.id === reportId);
      if (report) {
        report.status = status;
        report.moderatorNotes = notes;
        report.updatedAt = new Date();
      }
      toast.success('Report status updated');
      return;
    }

    const reportRef = doc(db, 'reports', reportId);
    await updateDoc(reportRef, {
      status,
      ...(notes && { moderatorNotes: notes }),
      updatedAt: serverTimestamp()
    });

    toast.success('Report status updated');
  } catch (error) {
    console.error('Error updating report:', error);
    toast.error('Failed to update report');
    throw error;
  }
};

export const deleteReport = async (reportId: string): Promise<void> => {
  try {
    if (import.meta.env.MODE === 'development') {
      demoReports = demoReports.filter(r => r.id !== reportId);
      toast.success('Report deleted');
      return;
    }

    await deleteDoc(doc(db, 'reports', reportId));
    toast.success('Report deleted');
  } catch (error) {
    console.error('Error deleting report:', error);
    toast.error('Failed to delete report');
    throw error;
  }
};

// Official Posts Functions
export const createOfficialPost = async (data: {
  title: string;
  content: string;
  type: 'announcement' | 'update' | 'event' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  media?: File[];
}) => {
  try {
    let mediaUrls: string[] = [];

    if (import.meta.env.MODE === 'development') {
      if (data.media) {
        mediaUrls = data.media.map(file => URL.createObjectURL(file));
      }

      const newPost = {
        id: `post-${Date.now()}`,
        ...data,
        media: mediaUrls,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      demoOfficialPosts.unshift(newPost);
      toast.success('Official post created successfully');
      return;
    }

    // Upload media files
    if (data.media) {
      mediaUrls = await Promise.all(
        data.media.map(async (file) => {
          const fileRef = ref(storage, `official-posts/${Date.now()}-${file.name}`);
          await uploadBytes(fileRef, file);
          return getDownloadURL(fileRef);
        })
      );
    }

    await addDoc(collection(db, 'official-posts'), {
      ...data,
      media: mediaUrls,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    toast.success('Official post created successfully');
  } catch (error) {
    console.error('Error creating official post:', error);
    toast.error('Failed to create official post');
    throw error;
  }
};

export const getOfficialPosts = async () => {
  if (import.meta.env.MODE === 'development') {
    return demoOfficialPosts;
  }

  try {
    const q = query(collection(db, 'official-posts'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching official posts:', error);
    throw error;
  }
};

export const deleteOfficialPost = async (postId: string) => {
  try {
    if (import.meta.env.MODE === 'development') {
      demoOfficialPosts = demoOfficialPosts.filter(p => p.id !== postId);
      toast.success('Official post deleted');
      return;
    }

    await deleteDoc(doc(db, 'official-posts', postId));
    toast.success('Official post deleted');
  } catch (error) {
    console.error('Error deleting official post:', error);
    toast.error('Failed to delete official post');
    throw error;
  }
};