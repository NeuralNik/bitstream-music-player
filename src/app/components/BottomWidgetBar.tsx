import React, { useRef } from 'react';
import { Volume2, VolumeX, Sun, Moon } from 'lucide-react';

interface BottomWidgetBarProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export function BottomWidgetBar({ isDarkMode, onToggleTheme, volume, onVolumeChange }: BottomWidgetBarProps) {
  const volumeBarRef = useRef<HTMLDivElement>(null);

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!volumeBarRef.current) return;
    const rect = volumeBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    onVolumeChange(percentage);
  };

  const volumePercent = Math.round(volume * 100);

  return (
    <div className={`h-[60px] ${isDarkMode ? 'bg-[#111] border-white shadow-[0px_-2px_0px_rgba(255,255,255,0.1)]' : 'bg-white border-black shadow-[0px_-2px_0px_rgba(0,0,0,0.05)]'} border-t-2 flex items-center justify-between px-4 flex-shrink-0 z-10 transition-colors duration-200`}>
      <div className="flex items-center gap-2.5 w-full">
        {volume === 0 ? (
          <VolumeX size={16} className={isDarkMode ? 'text-[#AAA]' : 'text-[#555555]'} />
        ) : (
          <Volume2 size={16} className={isDarkMode ? 'text-[#AAA]' : 'text-[#555555]'} />
        )}
        {/* Outer click target — tall invisible wrapper for easy clicking */}
        <div 
          ref={volumeBarRef}
          onClick={handleVolumeClick}
          className="flex-1 max-w-[140px] h-[24px] flex items-center relative cursor-pointer group"
        >
          {/* Visible track — thin bar inside the click area */}
          <div className={`w-full h-[6px] ${isDarkMode ? 'bg-[#333] border-white' : 'bg-[#DDD] border-black'} rounded-full border-[1.5px] relative pointer-events-none`}>
            <div 
              className={`h-full bg-[#00C853] rounded-l-[4.5px] transition-all duration-100`}
              style={{ width: `${volumePercent}%` }}
            />
          </div>
          {/* Thumb — positioned relative to the outer wrapper */}
          <div 
            className={`w-3 h-3 ${isDarkMode ? 'bg-[#111] border-white shadow-[1px_1px_0px_#FFFFFF]' : 'bg-white border-black shadow-[1px_1px_0px_#000000]'} border-[1.5px] rounded-full absolute top-1/2 -translate-y-1/2 -translate-x-1.5 z-20 group-hover:scale-110 active:scale-95 transition-all duration-120 pointer-events-none`}
            style={{ left: `${volumePercent}%` }}
          />
        </div>
      </div>
      <button 
        onClick={onToggleTheme}
        className={`w-[32px] h-[32px] flex items-center justify-center rounded-[8px] border-[1.5px] border-transparent active:scale-[0.97] transition-all duration-120 group
          ${isDarkMode 
            ? 'hover:bg-[#333] active:bg-[#FFD600] active:border-black' 
            : 'hover:bg-[#EAEAEA] active:bg-[#FFD600] active:border-black'}`}
      >
        {isDarkMode ? (
          <Sun size={14} className="text-[#AAA] group-active:text-black" />
        ) : (
          <Moon size={14} className="text-[#555] group-active:text-black" />
        )}
      </button>
    </div>
  );
}