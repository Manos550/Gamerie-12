// Add these types to your existing types.ts file

export type ReportType = 'user' | 'team' | 'post' | 'comment';
export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface Report {
  id: string;
  contentId: string;
  contentType: ReportType;
  contentAuthorId: string;
  reporterId: string;
  type: 'spam' | 'harassment' | 'inappropriate' | 'other';
  reason: string;
  status: ReportStatus;
  moderatorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}