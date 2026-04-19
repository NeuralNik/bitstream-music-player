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
      source?: 'local' | 'youtube';
    }>
  >;
  fetchYoutubePlaylist: (url: string) => Promise<{
    success: boolean;
    songs?: Array<{
      id: string;
      title: string;
      artist: string;
      path: string;
      albumArt: string;
      duration: number;
      source?: 'local' | 'youtube';
    }>;
    error?: string;
  }>;
  windowControl: (action: 'minimize' | 'close') => Promise<void>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
