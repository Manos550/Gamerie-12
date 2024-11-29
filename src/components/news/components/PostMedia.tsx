import React from 'react';
import { MediaItem } from '../../../types';

interface PostMediaProps {
  media: MediaItem[];
}

export default function PostMedia({ media }: PostMediaProps) {
  if (!media.length) return null;

  return (
    <div className={`grid gap-2 mb-4 ${
      media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
    }`}>
      {media.map((item, index) => (
        item.type === 'image' ? (
          <img
            key={index}
            src={item.url}
            alt=""
            loading="lazy"
            className="rounded-lg w-full h-64 object-cover"
          />
        ) : (
          <video
            key={index}
            src={item.url}
            controls
            className="rounded-lg w-full h-64 object-cover"
          />
        )
      ))}
    </div>
  );
}