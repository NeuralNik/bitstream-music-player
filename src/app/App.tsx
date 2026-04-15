import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TopBar } from './components/TopBar';
import { WidgetPlayer } from './components/WidgetPlayer';
import { PlaylistDrawer } from './components/PlaylistDrawer';
import { BottomWidgetBar } from './components/BottomWidgetBar';
import { Song } from './types';

export default function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audio.preload = 'auto';
    audioRef.current = audio;

    // Cleanup on unmount
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (currentSong && audio.duration && isFinite(audio.duration)) {
        // Update the song's duration with the real value
        setSongs((prev) =>
          prev.map((s) =>
            s.id === currentSong.id ? { ...s, duration: audio.duration } : s
          )
        );
        setCurrentSong((prev) =>
          prev ? { ...prev, duration: audio.duration } : prev
        );
      }
    };

    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        handleNext();
      }
    };

    const handleError = (e: Event) => {
      const mediaError = audio.error;
      console.error('Audio playback error:', mediaError?.code, mediaError?.message);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentSong, isRepeat, songs]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleLoadFolder = async () => {
    if (window.electronAPI) {
      setIsLoading(true);
      try {
        const result = await window.electronAPI.selectFolder();
        if (result.length > 0) {
          setSongs(result);
        }
      } catch (error) {
        console.error('Failed to load folder:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Fallback for browser development without Electron
      setIsLoading(true);
      setTimeout(() => {
        const mockSongs: Song[] = [
          { id: '1', title: 'Midnight City', artist: 'Neon Dreams', path: '', albumArt: '', duration: 234 },
          { id: '2', title: 'Sunset Drive', artist: 'Vapor Wave', path: '', albumArt: '', duration: 198 },
          { id: '3', title: 'Neon Lights', artist: 'Cyber Punk', path: '', albumArt: '', duration: 312 },
          { id: '4', title: 'Ocean Breeze', artist: 'Vapor Wave', path: '', albumArt: '', duration: 245 },
          { id: '5', title: 'Digital Dawn', artist: 'Neon Dreams', path: '', albumArt: '', duration: 280 },
          { id: '6', title: 'Cyber City', artist: 'Cyber Punk', path: '', albumArt: '', duration: 215 },
        ];
        setSongs(mockSongs);
        setIsLoading(false);
      }, 800);
    }
  };

  const handleSelectSong = useCallback((song: Song) => {
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentSong(song);
    setCurrentTime(0);

    if (song.path) {
      audio.src = song.path;
      audio.load();
      audio.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error('Playback failed:', err);
          setIsPlaying(false);
        });
    } else {
      // Mock mode: just update state
      setIsPlaying(true);
    }
  }, []);

  const handlePlayPause = () => {
    const audio = audioRef.current;

    if (!currentSong && songs.length > 0) {
      handleSelectSong(songs[0]);
      return;
    }

    if (!currentSong) {
      setIsPlaylistOpen(true);
      return;
    }

    if (audio && currentSong.path) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    } else {
      // Mock mode toggle
      setIsPlaying(!isPlaying);
    }
  };

  const handleNext = useCallback(() => {
    if (!currentSong || songs.length === 0) return;

    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * songs.length);
      handleSelectSong(songs[randomIndex]);
      return;
    }

    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    handleSelectSong(songs[nextIndex]);
  }, [currentSong, songs, isShuffle, handleSelectSong]);

  const handlePrev = () => {
    if (!currentSong || songs.length === 0) return;

    if (currentTime > 3) {
      // Restart current song
      if (audioRef.current && currentSong.path) {
        audioRef.current.currentTime = 0;
      }
      setCurrentTime(0);
      return;
    }

    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
    handleSelectSong(songs[prevIndex]);
  };

  const handleSeek = (time: number) => {
    if (audioRef.current && currentSong?.path) {
      audioRef.current.currentTime = time;
    }
    setCurrentTime(time);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(Math.max(0, Math.min(1, newVolume)));
  };

  return (
    <div className={`h-screen w-full bg-transparent flex items-center justify-center font-['Inter'] transition-colors duration-200`}>
      {/* Widget Container */}
      <div className={`w-[360px] h-[460px] ${isDarkMode ? 'bg-[#222] border-white shadow-[8px_8px_0px_#FFFFFF]' : 'bg-[#F4F4F4] border-black shadow-[8px_8px_0px_#000000]'} border-2 rounded-xl overflow-hidden flex flex-col relative mx-auto my-auto transition-colors duration-200`}>
        <TopBar 
          onTogglePlaylist={() => setIsPlaylistOpen(!isPlaylistOpen)}
          isPlaylistOpen={isPlaylistOpen}
          isDarkMode={isDarkMode}
        />
        
        <WidgetPlayer 
          currentSong={currentSong}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onNext={handleNext}
          onPrev={handlePrev}
          isShuffle={isShuffle}
          onToggleShuffle={() => setIsShuffle(!isShuffle)}
          isRepeat={isRepeat}
          onToggleRepeat={() => setIsRepeat(!isRepeat)}
          currentTime={currentTime}
          onSeek={handleSeek}
          isDarkMode={isDarkMode}
        />

        <PlaylistDrawer 
          isOpen={isPlaylistOpen}
          songs={songs} 
          isLoading={isLoading} 
          onLoadFolder={handleLoadFolder} 
          currentSong={currentSong}
          onSelectSong={handleSelectSong}
          isDarkMode={isDarkMode}
        />

        <BottomWidgetBar 
          isDarkMode={isDarkMode} 
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          volume={volume}
          onVolumeChange={handleVolumeChange}
        />
      </div>
    </div>
  );
}
