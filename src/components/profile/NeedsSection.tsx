import React, { useState } from 'react';
import { NeedInfo } from '../../types';
import { Search, Clock, Plus, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../../lib/store';
import { updateProfile } from '../../lib/profile';
import { toast } from 'react-toastify';
import AddNeedModal from './AddNeedModal';

interface NeedsSectionProps {
  needs: NeedInfo[];
  isEditable?: boolean;
}

export default function NeedsSection({ needs, isEditable }: NeedsSectionProps) {
  const [isAddingNeed, setIsAddingNeed] = useState(false);
  const { user } = useAuthStore();
  const activeNeeds = needs.filter(need => need.active);

  const handleDeleteNeed = async (needToDelete: NeedInfo) => {
    if (!user) return;

    try {
      const updatedNeeds = needs.filter(need => 
        need.type !== needToDelete.type || 
        need.game !== needToDelete.game || 
        need.createdAt !== needToDelete.createdAt
      );
      
      await updateProfile(user.id, { needs: updatedNeeds });
      toast.success('Request removed successfully');
    } catch (error) {
      toast.error('Failed to remove request');
    }
  };

  return (
    <div className="bg-gaming-card rounded-lg border border-gaming-neon/20 p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gaming-neon" />
          <h2 className="font-display text-lg font-bold text-white">
            Looking For
          </h2>
        </div>
        {isEditable && (
          <button
            onClick={() => setIsAddingNeed(true)}
            className="flex items-center gap-1 px-2 py-1 text-sm bg-gaming-neon/10 text-gaming-neon rounded-md hover:bg-gaming-neon/20 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        )}
      </div>

      {activeNeeds.length === 0 ? (
        <p className="text-center py-2 text-sm text-gray-400">No active requests</p>
      ) : (
        <div className="space-y-2">
          {activeNeeds.map((need, index) => (
            <div
              key={index}
              className="p-3 rounded-lg bg-gaming-dark/50 text-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-gaming-neon font-medium">{need.type}</span>
                {isEditable && (
                  <button
                    onClick={() => handleDeleteNeed(need)}
                    className="text-gray-400 hover:text-gaming-accent p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <span className="block text-xs text-gray-400 mb-1">{need.game}</span>
              <p className="text-gray-200 text-sm mb-2">{need.description}</p>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                <span>
                  {formatDistanceToNow(need.createdAt, { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAddingNeed && (
        <AddNeedModal onClose={() => setIsAddingNeed(false)} />
      )}
    </div>
  );
}