import React, { useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Music } from 'lucide-react';
import { Song } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface WidgetPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  isShuffle: boolean;
  onToggleShuffle: () => void;
  isRepeat: boolean;
  onToggleRepeat: () => void;
  currentTime: number;
  onSeek: (time: number) => void;
  isDarkMode: boolean;
}

function AlbumArt({ song, isDarkMode }: { song: Song; isDarkMode: boolean }) {
  if (song.albumArt) {
    return (
      <ImageWithFallback 
        src={song.albumArt} 
        alt={song.title} 
        className={`w-[150px] h-[150px] object-cover rounded-[12px] border-[3px] ${isDarkMode ? 'border-white shadow-[4px_4px_0px_#FFFFFF]' : 'border-black shadow-[4px_4px_0px_#000000]'} bg-[#FFD600]`}
      />
    );
  }

  // Default album art with gradient and music icon
  return (
    <div className={`w-[150px] h-[150px] rounded-[12px] border-[3px] ${isDarkMode ? 'border-white shadow-[4px_4px_0px_#FFFFFF]' : 'border-black shadow-[4px_4px_0px_#000000]'} bg-gradient-to-br from-[#7B61FF] via-[#FF6B00] to-[#FFD600] flex items-center justify-center`}>
      <div className={`w-16 h-16 rounded-full border-[3px] ${isDarkMode ? 'border-white' : 'border-black'} bg-white/20 backdrop-blur-sm flex items-center justify-center`}>
        <Music size={28} className="text-white" />
      </div>
    </div>
  );
}

export function WidgetPlayer({
  currentSong,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  isShuffle,
  onToggleShuffle,
  isRepeat,
  onToggleRepeat,
  currentTime,
  onSeek,
  isDarkMode
}: WidgetPlayerProps) {
  const progressBarRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !currentSong) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    onSeek(percentage * currentSong.duration);
  };

  const btnBase = `w-[36px] h-[36px] flex items-center justify-center rounded-[8px] border-2 transition-all duration-120 active:scale-[0.95]`;
  const btnPrimary = `w-[48px] h-[48px] flex items-center justify-center rounded-[12px] border-[2.5px] transition-all duration-120 active:translate-y-0.5 active:translate-x-0.5`;

  if (!currentSong) {
    return (
      <div className={`flex-1 w-full flex flex-col items-center justify-center px-4 ${isDarkMode ? 'bg-[#222]' : 'bg-[#F4F4F4]'} transition-colors duration-200`}>
        <div className={`w-[150px] h-[150px] rounded-[12px] border-[3px] ${isDarkMode ? 'border-white bg-[#333] shadow-[4px_4px_0px_#FFFFFF]' : 'border-black bg-[#EAEAEA] shadow-[4px_4px_0px_#000000]'} flex items-center justify-center`}>
          <div className={`w-12 h-12 rounded-full border-[2.5px] ${isDarkMode ? 'border-white' : 'border-black'} bg-[#D1C4E9] opacity-50`} />
        </div>
        <div className="mt-5 text-center">
          <h2 className={`font-['Space_Grotesk'] font-bold text-[16px] ${isDarkMode ? 'text-white' : 'text-[#111111]'}`}>Ready to Play</h2>
          <p className={`font-['Inter'] text-[12px] ${isDarkMode ? 'text-[#AAA]' : 'text-[#555555]'} mt-1`}>Open playlist to start</p>
        </div>
      </div>
    );
  }

  const progressPercentage = currentSong.duration > 0 
    ? Math.min(100, (currentTime / currentSong.duration) * 100)
    : 0;

  return (
    <div className={`flex-1 w-full flex flex-col items-center justify-start pt-6 px-4 ${isDarkMode ? 'bg-[#222]' : 'bg-[#F4F4F4]'} transition-colors duration-200`}>
      {/* Compact Album Art */}
      <div className="relative group cursor-pointer active:scale-[0.98] transition-transform duration-120">
        <AlbumArt song={currentSong} isDarkMode={isDarkMode} />
        <div className={`absolute inset-0 rounded-[10px] border-[3px] border-transparent ${isDarkMode ? 'group-hover:border-white' : 'group-hover:border-black'} pointer-events-none transition-colors opacity-50 mix-blend-overlay`}></div>
      </div>

      {/* Tightly Spaced Song Info */}
      <div className="mt-4 flex flex-col items-center text-center w-full max-w-[260px] gap-1">
        <h2 className={`font-['Space_Grotesk'] font-bold text-[16px] leading-tight ${isDarkMode ? 'text-white' : 'text-[#111111]'} truncate w-full`}>
          {currentSong.title}
        </h2>
        <p className={`font-['Inter'] text-[12px] ${isDarkMode ? 'text-[#AAA]' : 'text-[#555555]'} truncate w-full`}>
          {currentSong.artist}
        </p>
      </div>

      {/* Thin Progress Bar wrapped in taller click target */}
      <div className="w-full mt-5 px-3">
        <div 
          ref={progressBarRef}
          onClick={handleProgressClick}
          className="w-full h-[24px] cursor-pointer flex items-center relative group"
        >
          {/* Background Track */}
          <div className={`w-full h-[6px] ${isDarkMode ? 'bg-[#444] border-white' : 'bg-[#DDD] border-black'} rounded-[6px] border-[1.5px] relative pointer-events-none`}>
            {/* Filled Track */}
            <div 
              className={`h-full bg-[#7B61FF] rounded-l-[4px] transition-all duration-100 ease-linear pointer-events-none`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          {/* Thumb */}
          <div 
            className={`w-3 h-3 ${isDarkMode ? 'bg-[#111] border-white shadow-[1px_1px_0px_#FFFFFF]' : 'bg-white border-black shadow-[1px_1px_0px_#000000]'} border-[1.5px] rounded-full absolute top-1/2 -translate-y-1/2 z-20 pointer-events-none transition-all duration-100`}
            style={{ left: `calc(${progressPercentage}% - 6px)` }}
          />
        </div>
        <div className={`flex justify-between items-center mt-1 font-['Space_Grotesk'] font-bold text-[10px] ${isDarkMode ? 'text-[#AAA]' : 'text-[#555555]'}`}>
          <span>{formatTime(currentTime)}</span>
          <span>{currentSong.duration > 0 ? formatTime(currentSong.duration) : '--:--'}</span>
        </div>
      </div>

      {/* Grouped Controls */}
      <div className="mt-4 flex items-center gap-3">
        <button 
          onClick={onToggleShuffle}
          className={`${btnBase} ${isDarkMode ? 'border-white' : 'border-black'} ${isShuffle ? (isDarkMode ? 'bg-[#FFD600] shadow-[2px_2px_0px_#FFFFFF]' : 'bg-[#FFD600] shadow-[2px_2px_0px_#000000]') : (isDarkMode ? 'bg-[#111] hover:bg-[#333]' : 'bg-white hover:bg-[#EAEAEA]')}`}
        >
          <Shuffle size={14} className={isShuffle ? 'text-black' : (isDarkMode ? 'text-white' : 'text-[#111111]')} />
        </button>
        
        <button 
          onClick={onPrev}
          className={`${btnBase} ${isDarkMode ? 'border-white bg-[#111] hover:bg-[#333] shadow-[2px_2px_0px_#FFFFFF] active:shadow-[0px_0px_0px_#FFFFFF]' : 'border-black bg-white hover:bg-[#EAEAEA] shadow-[2px_2px_0px_#000000] active:shadow-[0px_0px_0px_#000000]'} active:bg-[#FFD600] active:translate-y-0.5 active:translate-x-0.5`}
        >
          <SkipBack size={16} className={`${isDarkMode ? 'text-white' : 'text-[#111111]'} fill-current`} />
        </button>

        <button 
          onClick={onPlayPause}
          className={`${btnPrimary} ${isDarkMode ? 'border-white shadow-[3px_3px_0px_#FFFFFF] active:shadow-[1px_1px_0px_#FFFFFF]' : 'border-black shadow-[3px_3px_0px_#000000] active:shadow-[1px_1px_0px_#000000]'} bg-[#7B61FF] hover:bg-[#684DEC] active:bg-[#FFD600] text-white active:text-black`}
        >
          {isPlaying ? (
            <Pause size={20} className="fill-current" />
          ) : (
            <Play size={20} className="fill-current ml-1" />
          )}
        </button>

        <button 
          onClick={onNext}
          className={`${btnBase} ${isDarkMode ? 'border-white bg-[#111] hover:bg-[#333] shadow-[2px_2px_0px_#FFFFFF] active:shadow-[0px_0px_0px_#FFFFFF]' : 'border-black bg-white hover:bg-[#EAEAEA] shadow-[2px_2px_0px_#000000] active:shadow-[0px_0px_0px_#000000]'} active:bg-[#FFD600] active:translate-y-0.5 active:translate-x-0.5`}
        >
          <SkipForward size={16} className={`${isDarkMode ? 'text-white' : 'text-[#111111]'} fill-current`} />
        </button>

        <button 
          onClick={onToggleRepeat}
          className={`${btnBase} ${isDarkMode ? 'border-white' : 'border-black'} ${isRepeat ? (isDarkMode ? 'bg-[#FFD600] shadow-[2px_2px_0px_#FFFFFF]' : 'bg-[#FFD600] shadow-[2px_2px_0px_#000000]') : (isDarkMode ? 'bg-[#111] hover:bg-[#333]' : 'bg-white hover:bg-[#EAEAEA]')}`}
        >
          <Repeat size={14} className={isRepeat ? 'text-black' : (isDarkMode ? 'text-white' : 'text-[#111111]')} />
        </button>
      </div>
    </div>
  );
}