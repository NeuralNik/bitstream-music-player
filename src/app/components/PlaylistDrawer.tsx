import React, { useState } from 'react';
import { FolderPlus, Loader2, Search, Music } from 'lucide-react';
import { Song } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface PlaylistDrawerProps {
  isOpen: boolean;
  songs: Song[];
  isLoading: boolean;
  onLoadFolder: () => void;
  currentSong: Song | null;
  onSelectSong: (song: Song) => void;
  isDarkMode: boolean;
}

function SongThumbnail({ song, isDarkMode, size = 'sm' }: { song: Song; isDarkMode: boolean; size?: 'sm' | 'md' }) {
  const dimension = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const rounded = size === 'sm' ? 'rounded-[4px]' : 'rounded-[6px]';

  if (song.albumArt) {
    return (
      <ImageWithFallback 
        src={song.albumArt} 
        alt={song.title} 
        className={`${dimension} ${rounded} border-[1.5px] ${isDarkMode ? 'border-white' : 'border-black'} object-cover bg-white flex-shrink-0`} 
      />
    );
  }

  // Default music note placeholder with gradient
  return (
    <div className={`${dimension} ${rounded} border-[1.5px] ${isDarkMode ? 'border-white' : 'border-black'} bg-gradient-to-br from-[#7B61FF] to-[#FF6B00] flex items-center justify-center flex-shrink-0`}>
      <Music size={size === 'sm' ? 12 : 16} className="text-white" />
    </div>
  );
}

export function PlaylistDrawer({ 
  isOpen, songs, isLoading, onLoadFolder, currentSong, onSelectSong, isDarkMode 
}: PlaylistDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredSongs = songs.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds === 0) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`absolute top-[40px] bottom-[60px] right-0 w-[260px] ${isDarkMode ? 'bg-[#111] border-white' : 'bg-white border-black'} border-l-2 z-20 transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? `translate-x-0 ${isDarkMode ? 'shadow-[-4px_0px_0px_rgba(255,255,255,0.1)]' : 'shadow-[-4px_0px_0px_rgba(0,0,0,0.15)]'}` : 'translate-x-full'}`}
    >
      <div className={`p-3 border-b-2 ${isDarkMode ? 'border-white bg-[#222]' : 'border-black bg-[#F4F4F4]'} flex flex-col gap-3 transition-colors duration-200`}>
        <div className="relative">
          <Search size={14} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-[#AAA]' : 'text-[#555555]'}`} />
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full h-8 pl-8 pr-2 ${isDarkMode ? 'bg-[#111] border-white text-white focus:bg-[#333]' : 'bg-white border-black text-[#111] focus:bg-[#EAEAEA]'} border-2 rounded-[6px] font-['Inter'] text-[12px] focus:outline-none transition-colors duration-120`}
          />
        </div>
        <button 
          onClick={onLoadFolder}
          disabled={isLoading}
          className={`w-full h-9 bg-[#00C853] hover:bg-[#00E676] active:bg-[#FFD600] text-black font-['Space_Grotesk'] font-bold text-[12px] rounded-[6px] border-2 ${isDarkMode ? 'border-white shadow-[2px_2px_0px_#FFFFFF]' : 'border-black shadow-[2px_2px_0px_#000000]'} active:shadow-[0px_0px_0px_transparent] active:translate-y-0.5 active:translate-x-0.5 active:scale-[0.97] transition-all duration-120 flex items-center justify-center gap-2 disabled:opacity-50`}
        >
          {isLoading ? <Loader2 className="animate-spin" size={14} /> : <FolderPlus size={14} />}
          {isLoading ? 'Scanning...' : 'Select Folder'}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 custom-scrollbar">
        {songs.length === 0 && !isLoading ? (
          <div className="text-center mt-6 opacity-60">
            <p className={`font-['Space_Grotesk'] font-bold text-[12px] ${isDarkMode ? 'text-white' : 'text-[#111111]'}`}>Empty Playlist</p>
            <p className={`font-['Inter'] text-[10px] mt-1 ${isDarkMode ? 'text-[#888]' : 'text-[#777]'}`}>Select a folder to load music</p>
          </div>
        ) : (
          filteredSongs.map(song => {
            const isActive = currentSong?.id === song.id;
            return (
              <div 
                key={song.id}
                onClick={() => onSelectSong(song)}
                className={`flex items-center gap-2 p-1.5 h-[48px] rounded-[8px] border-2 cursor-pointer transition-all duration-120 active:scale-[0.97] ${
                  isActive 
                    ? (isDarkMode ? 'bg-[#FFD600] border-white shadow-[2px_2px_0px_#FFFFFF]' : 'bg-[#FFD600] border-black shadow-[2px_2px_0px_#000000]') 
                    : (isDarkMode ? 'bg-[#111] border-white hover:bg-[#333]' : 'bg-white border-black hover:bg-[#EAEAEA]')
                }`}
              >
                <SongThumbnail song={song} isDarkMode={isDarkMode} />
                <div className="flex-1 min-w-0">
                  <h3 className={`font-['Space_Grotesk'] font-bold text-[12px] truncate leading-tight ${isActive ? 'text-black' : (isDarkMode ? 'text-white' : 'text-[#111111]')}`}>
                    {song.title}
                  </h3>
                  <p className={`font-['Inter'] text-[10px] truncate mt-0.5 leading-tight ${isActive ? 'text-[#333]' : (isDarkMode ? 'text-[#AAA]' : 'text-[#555555]')}`}>
                    {song.artist}
                  </p>
                </div>
                <span className={`font-['Space_Grotesk'] text-[10px] flex-shrink-0 ${isActive ? 'text-[#333]' : (isDarkMode ? 'text-[#666]' : 'text-[#999]')}`}>
                  {formatDuration(song.duration)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}