import React from 'react';
import { Music, ListMusic, Minus, X } from 'lucide-react';

interface TopBarProps {
  onTogglePlaylist: () => void;
  isPlaylistOpen: boolean;
  isDarkMode: boolean;
}

export function TopBar({ onTogglePlaylist, isPlaylistOpen, isDarkMode }: TopBarProps) {
  const handleMinimize = () => {
    window.electronAPI?.windowControl('minimize');
  };

  const handleClose = () => {
    window.electronAPI?.windowControl('close');
  };

  return (
    <div 
      className={`h-[40px] ${isDarkMode ? 'bg-[#111] border-white' : 'bg-white border-black'} border-b-2 flex items-center justify-between px-3 flex-shrink-0 select-none relative z-30 transition-colors duration-200`}
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex items-center gap-2">
        <div className={`w-5 h-5 rounded bg-[#00C853] border-[1.5px] ${isDarkMode ? 'border-white shadow-[1px_1px_0px_#FFFFFF]' : 'border-black shadow-[1px_1px_0px_#000000]'} flex items-center justify-center`}>
          <Music size={10} className="text-black" />
        </div>
        <span className={`font-['Space_Grotesk'] font-bold text-[12px] tracking-widest uppercase ${isDarkMode ? 'text-white' : 'text-[#111111]'}`}>
          Bitstream
        </span>
      </div>

      <div 
        className="flex items-center gap-1.5"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button 
          onClick={onTogglePlaylist} 
          className={`w-6 h-6 flex items-center justify-center rounded border-[1.5px] active:scale-[0.97] transition-all duration-120 
            ${isPlaylistOpen 
              ? (isDarkMode ? 'border-white bg-[#FFD600]' : 'border-black bg-[#FFD600]') 
              : 'border-transparent ' + (isDarkMode ? 'hover:bg-[#333]' : 'hover:bg-[#EAEAEA]')}`}
        >
          <ListMusic size={12} className={isPlaylistOpen ? 'text-black' : (isDarkMode ? 'text-white' : 'text-black')} />
        </button>
        <div className={`w-[1.5px] h-4 ${isDarkMode ? 'bg-white/20' : 'bg-black/20'} mx-1`}></div>
        <button 
          onClick={handleMinimize}
          className={`w-6 h-6 flex items-center justify-center rounded border-[1.5px] border-transparent active:scale-[0.97] transition-all duration-120 group ${isDarkMode ? 'hover:bg-[#333] active:border-white' : 'hover:bg-[#EAEAEA] active:border-black'}`}
        >
          <Minus size={12} className={`${isDarkMode ? 'text-[#AAA] group-hover:text-white' : 'text-[#555] group-hover:text-black'}`} />
        </button>
        <button 
          onClick={handleClose}
          className={`w-6 h-6 flex items-center justify-center rounded hover:bg-[#FF6B00] border-[1.5px] border-transparent active:scale-[0.97] transition-all duration-120 group ${isDarkMode ? 'active:border-white' : 'active:border-black'}`}
        >
          <X size={12} className={`${isDarkMode ? 'text-[#AAA] group-hover:text-white' : 'text-[#555] group-hover:text-white'}`} />
        </button>
      </div>
    </div>
  );
}