'use client';

import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';

interface CameraPermissionExplainerProps {
  onClose: () => void;
  dataTestId?: string;
}

export function CameraPermissionExplainer({ onClose, dataTestId }: CameraPermissionExplainerProps) {
  return (
    <Sheet
      isOpen={true}
      onClose={onClose}
      title="Camera Permission Required"
      data-testid={dataTestId}
    >
      <div className="space-y-4 text-center">
        <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Camera Access Needed</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            To capture photo evidence, this app needs access to your camera. 
            On web, this requires granting camera permission in your browser settings.
          </p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-left text-sm">
          <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">How to enable:</p>
          <ol className="space-y-1 text-gray-600 dark:text-gray-400 list-decimal list-inside">
            <li>Click the camera icon in your browser&apos;s address bar</li>
            <li>Select &quot;Allow&quot; for camera access</li>
            <li>Refresh this page</li>
          </ol>
        </div>
        <Button onClick={onClose} className="w-full">
          Got it
        </Button>
      </div>
    </Sheet>
  );
}