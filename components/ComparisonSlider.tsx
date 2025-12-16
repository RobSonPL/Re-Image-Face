
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ beforeImage, afterImage }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Slider Logic
  const handleSliderMove = useCallback((clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setSliderPosition(percentage);
    }
  }, []);

  const handleSliderMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent panning when clicking slider
    setIsDragging(true);
  };
  
  const handleSliderTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsDragging(true);
  };

  // Global events for slider dragging
  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleTouchEnd = () => setIsDragging(false);
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) handleSliderMove(e.clientX);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) handleSliderMove(e.touches[0].clientX);
    };

    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleTouchEnd);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove);
    }
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDragging, handleSliderMove]);


  // Zoom/Pan Logic
  const handleZoomIn = () => setScale(s => Math.min(s + 0.5, 4));
  const handleZoomOut = () => {
    setScale(s => {
      const newScale = Math.max(s - 0.5, 1);
      if (newScale === 1) setPosition({ x: 0, y: 0 }); // Reset pos if unzoomed
      return newScale;
    });
  };
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handlePanStart = (clientX: number, clientY: number) => {
    if (scale > 1) {
      setIsPanning(true);
      setStartPan({ x: clientX - position.x, y: clientY - position.y });
    }
  };

  const handlePanMove = (clientX: number, clientY: number) => {
    if (isPanning && scale > 1) {
      setPosition({
        x: clientX - startPan.x,
        y: clientY - startPan.y
      });
    }
  };

  const handlePanEnd = () => setIsPanning(false);

  return (
    <div className="relative w-full max-w-md mx-auto group">
      
      {/* Zoom Controls */}
      <div className="absolute -right-12 top-0 flex flex-col gap-2 z-20">
        <button onClick={handleZoomIn} className="p-2 bg-white text-slate-700 rounded-lg shadow-md hover:bg-slate-50 transition-colors" title="Zoom In">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
        <button onClick={handleZoomOut} className="p-2 bg-white text-slate-700 rounded-lg shadow-md hover:bg-slate-50 transition-colors" title="Zoom Out">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
        </button>
        <button onClick={handleReset} className="p-2 bg-white text-slate-700 rounded-lg shadow-md hover:bg-slate-50 transition-colors" title="Reset View">
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
      </div>

      <div 
        ref={containerRef}
        className={`relative w-full aspect-square md:aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl select-none ${scale > 1 ? 'cursor-move' : 'cursor-default'}`}
        onMouseDown={(e) => handlePanStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handlePanMove(e.clientX, e.clientY)}
        onMouseUp={handlePanEnd}
        onMouseLeave={handlePanEnd}
        onTouchStart={(e) => handlePanStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => handlePanMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={handlePanEnd}
      >
        {/* Images Container - Applies Transform */}
        {/* We apply the transform to the IMAGES, not the container, so the clip-path on the container still works relative to viewport */}
        
        {/* After Image (Background) */}
        <img 
          src={afterImage} 
          alt="After" 
          className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none transition-transform duration-75 ease-out" 
          style={{ transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)` }}
        />

        {/* Before Image (Clipped) */}
        <div 
          className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img 
            src={beforeImage} 
            alt="Before" 
            className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-75 ease-out" 
            style={{ transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)` }}
          />
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleSliderMouseDown}
          onTouchStart={handleSliderTouchStart}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-[-4px]">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>

        {/* Labels (Hide when zoomed to avoid obstruction) */}
        {scale === 1 && (
          <>
            <div className="absolute top-4 left-4 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm pointer-events-none transition-opacity duration-300 group-hover:opacity-0">
              ORIGINAL
            </div>
            <div className="absolute top-4 right-4 bg-indigo-600/80 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm pointer-events-none transition-opacity duration-300 group-hover:opacity-0">
              AI GENERATED
            </div>
          </>
        )}
      </div>
    </div>
  );
};
