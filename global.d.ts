declare module 'hpp';
declare module '@vitejs/plugin-react';

declare global {
  interface Window {
    __deferredPrompt: any | null;
    __pwaInstallable: boolean;
    __pwaInstalled: boolean;
  }
}

export {};

