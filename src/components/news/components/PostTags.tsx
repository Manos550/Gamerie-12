import React from 'react';
import { Link } from 'react-router-dom';

interface PostTagsProps {
  tags: string[];
}

export default function PostTags({ tags }: PostTagsProps) {
  if (!tags.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {tags.map((tag, index) => (
        <Link
          key={index}
          to={`/news/tag/${tag}`}
          className="px-3 py-1 rounded-full bg-gaming-dark text-gaming-neon text-sm hover:bg-gaming-neon/10"
        >
          #{tag}
        </Link>
      ))}
    </div>
  );
}