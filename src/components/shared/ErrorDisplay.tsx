import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  error: Error | unknown;
}

export default function ErrorDisplay({ error }: ErrorDisplayProps) {
  const errorMessage = error instanceof Error ? error.message : 'An error occurred';

  return (
    <div className="rounded-lg bg-red-500/10 p-4 border border-red-500/20">
      <div className="flex items-center gap-2 text-red-500">
        <AlertCircle className="w-5 h-5" />
        <span className="font-medium">{errorMessage}</span>
      </div>
    </div>
  );
}