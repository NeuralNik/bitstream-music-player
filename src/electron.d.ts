export {};

interface ElectronAPI {
  selectFolder: () => Promise<
    Array<{
      id: string;
      title: string;
      artist: string;
      path: string;
      albumArt: string;
      duration: number;
    }>
  >;
  windowControl: (action: 'minimize' | 'close') => Promise<void>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
