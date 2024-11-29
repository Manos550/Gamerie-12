import React, { useState } from 'react';
import { Camera, Upload } from 'lucide-react';
import { User } from '../../../types';
import { uploadProfileImage } from '../../../lib/profile';

interface MediaTabProps {
  profile: User;
}

export default function MediaTab({ profile }: MediaTabProps) {
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [previewProfile, setPreviewProfile] = useState<string | null>(null);
  const [previewBackground, setPreviewBackground] = useState<string | null>(null);

  const handleImageUpload = async (file: File, type: 'profile' | 'background') => {
    const setUploading = type === 'profile' ? setUploadingProfile : setUploadingBackground;
    const setPreview = type === 'profile' ? setPreviewProfile : setPreviewBackground;
    
    setUploading(true);
    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload image
      await uploadProfileImage(profile.id, file, type);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Profile Image
        </label>
        <div className="relative group">
          <img
            src={previewProfile || profile.profileImage || 'https://via.placeholder.com/150'}
            alt="Profile"
            className="w-32 h-32 rounded-lg object-cover"
          />
          <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file, 'profile');
              }}
            />
            {uploadingProfile ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-gaming-neon border-t-transparent" />
            ) : (
              <Camera className="w-6 h-6 text-white" />
            )}
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Background Image
        </label>
        <div className="relative group">
          <img
            src={previewBackground || profile.backgroundImage || 'https://via.placeholder.com/800x200'}
            alt="Background"
            className="w-full h-32 rounded-lg object-cover"
          />
          <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file, 'background');
              }}
            />
            {uploadingBackground ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-gaming-neon border-t-transparent" />
            ) : (
              <Upload className="w-6 h-6 text-white" />
            )}
          </label>
        </div>
      </div>
    </div>
  );
}