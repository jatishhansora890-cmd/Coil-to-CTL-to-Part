
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { toast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // We don't console.error here to avoid double-logging in DevOverlay
      // but we do show a toast for standard production environments
      toast({
        variant: "destructive",
        title: "Security Shield Blocked Action",
        description: `Audit variance detected: ${error.message}. Please check master data constraints.`,
      });
      
      // In development, we throw an uncaught error to trigger the Next.js Dev Overlay
      if (process.env.NODE_ENV === 'development') {
        throw error;
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, []);

  return null;
}
