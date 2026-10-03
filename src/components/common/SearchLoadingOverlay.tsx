import React from 'react';

interface LoadingOverlayProps {
  title?: string;
  subtitle?: string;
}

export const GlobalLoadingOverlay: React.FC<LoadingOverlayProps> = ({
  title = 'Processing...',
  subtitle = 'Please wait while we prepare your information',
}) => {
  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[3px] flex items-center justify-center select-none cursor-wait transition-all animate-in fade-in duration-200"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      {/* Loading Modal Card */}
      <div className="relative bg-white border border-slate-200/80 rounded shadow-2xl p-7 max-w-xs sm:max-w-sm w-full mx-4 text-center overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Animated Top Gradient Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-teal-400 to-sky-600 animate-pulse" />

        {/* Center Icon with Pulse Wave */}
        <div className="relative w-14 h-14 mx-auto mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-sky-500/15 animate-ping opacity-75 duration-1000" />
          <div className="relative w-12 h-12 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-md border-2 border-white">
            +
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-1 mb-5">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-slate-500 leading-normal">
            {subtitle}
          </p>
        </div>

        {/* Ultra-Clean 3-Dots Wave Animation */}
        <div className="flex items-center justify-center gap-2">
          <span 
            className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block animate-bounce shadow-xs" 
            style={{ animationDuration: '0.6s', animationDelay: '0ms' }}
          />
          <span 
            className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block animate-bounce shadow-xs" 
            style={{ animationDuration: '0.6s', animationDelay: '150ms' }}
          />
          <span 
            className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block animate-bounce shadow-xs" 
            style={{ animationDuration: '0.6s', animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
};

export const SearchLoadingOverlay = GlobalLoadingOverlay;
