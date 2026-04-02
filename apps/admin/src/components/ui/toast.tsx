'use client';

import { Toaster as Sonner } from 'sonner';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  description?: string;
}

const toastFunctions: Record<ToastType, (message: string, options?: ToastOptions) => void> = {
  success: () => {}, // Placeholder - will be set by sonner
  error: () => {},
  info: () => {},
  warning: () => {},
};

// This will be replaced by actual sonner functions at runtime
let toastModule: typeof import('sonner') | null = null;

export function toast(message: string, options?: ToastOptions & { type?: ToastType }) {
  const type = options?.type || 'info';
  
  // Dynamic import of sonner to avoid issues with SSR
  if (!toastModule) {
    import('sonner').then((mod) => {
      toastModule = mod;
      const fn = mod[type] || mod.toast;
      fn(message, options);
    });
  } else {
    const fn = toastModule[type] || toastModule.toast;
    fn(message, options);
  }
}

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        classNames: {
          toast: 'bg-white border border-gray-200',
          title: 'text-gray-900 font-medium',
          description: 'text-gray-500',
          actionButton: 'bg-green-600 text-white',
          cancelButton: 'bg-gray-100 text-gray-900',
        },
      }}
    />
  );
}

export { Sonner };