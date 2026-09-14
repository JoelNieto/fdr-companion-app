'use client';

import Image from 'next/image';

interface PhotoGridProps {
  photos: Array<{
    id: string;
    uri: string;
    timestamp: string;
  }>;
  dataTestId?: string;
}

export function PhotoGrid({ photos, dataTestId }: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400" data-testid={dataTestId}>
        No photos yet. Tap &quot;Add Photo&quot; to capture evidence.
      </div>
    );
  }
  
  return (
    <div data-testid={dataTestId} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {photos.map(photo => (
        <div
          key={photo.id}
          data-testid={`wo-photo-thumb-${photo.id}`}
          className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
        >
          <Image
            src={photo.uri}
            alt={`Work order photo ${photo.id}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent text-white text-xs">
            {new Date(photo.timestamp).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}