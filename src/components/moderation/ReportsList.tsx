import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Report, ReportStatus } from '../../types';
import { getReports, updateReportStatus, deleteReport } from '../../lib/moderation';
import { Flag, Check, X, Trash2, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ReportsList() {
  const [filter, setFilter] = useState<ReportStatus | undefined>();

  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['reports', filter],
    queryFn: () => getReports(filter)
  });

  const handleUpdateStatus = async (reportId: string, status: ReportStatus, notes?: string) => {
    try {
      await updateReportStatus(reportId, status, notes);
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await deleteReport(reportId);
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gaming-dark/50 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-gaming-accent">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
        <p>Error loading reports</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => setFilter(undefined)}
          className={`px-4 py-2 rounded-md transition-colors ${
            !filter
              ? 'bg-gaming-neon text-black'
              : 'bg-gaming-dark text-white hover:bg-gaming-neon/20'
          }`}
        >
          All
        </button>
        {(['pending', 'resolved', 'dismissed'] as ReportStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-md transition-colors ${
              filter === status
                ? 'bg-gaming-neon text-black'
                : 'bg-gaming-dark text-white hover:bg-gaming-neon/20'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {reports?.map((report) => (
          <div
            key={report.id}
            className="bg-gaming-card rounded-lg p-4 border border-gaming-neon/20"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-gaming-neon" />
                  <span className="font-medium text-white">
                    {report.type} - {report.contentType}
                  </span>
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  Reported {formatDistanceToNow(report.createdAt, { addSuffix: true })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {report.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(report.id, 'resolved')}
                      className="p-2 text-green-500 hover:bg-green-500/10 rounded-full"
                      title="Mark as resolved"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                      className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded-full"
                      title="Dismiss report"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(report.id)}
                  className="p-2 text-gaming-accent hover:bg-gaming-accent/10 rounded-full"
                  title="Delete report"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-gray-300 mb-4">{report.reason}</p>

            {report.moderatorNotes && (
              <div className="mt-4 p-3 bg-gaming-dark/50 rounded-lg">
                <div className="text-sm font-medium text-gaming-neon mb-1">Moderator Notes</div>
                <p className="text-gray-400 text-sm">{report.moderatorNotes}</p>
              </div>
            )}
          </div>
        ))}

        {reports?.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No reports found
          </div>
        )}
      </div>
    </div>
  );
}