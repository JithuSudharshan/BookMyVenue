import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, CheckCircle2 } from 'lucide-react';

const SlideToCancel = ({ onConfirm, isLoading }) => {
  const [sliderVal, setSliderVal] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const trackRef = useRef(null);

  // Stop dragging on unmount or confirm
  useEffect(() => {
    if (isConfirmed || isLoading) {
      setSliderVal(100);
      setIsDragging(false);
    }
  }, [isConfirmed, isLoading]);

  const handlePointerDown = (e) => {
    if (isConfirmed || isLoading) return;
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || isConfirmed || isLoading) return;
    updateSlider(e.clientX || (e.touches && e.touches[0].clientX));
  };

  const handlePointerUp = () => {
    if (!isDragging || isConfirmed || isLoading) return;
    setIsDragging(false);

    if (sliderVal > 90) {
      setSliderVal(100);
      setIsConfirmed(true);
      onConfirm();
    } else {
      setSliderVal(0); // snap back
    }
  };

  const updateSlider = (clientX) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const thumbWidth = 48; // width of the thumb
    let newX = clientX - rect.left - thumbWidth / 2;
    const maxX = rect.width - thumbWidth;
    
    if (newX < 0) newX = 0;
    if (newX > maxX) newX = maxX;

    const percentage = (newX / maxX) * 100;
    setSliderVal(percentage);
  };

  // Add global mouseup/touchend to catch drags outside the container
  useEffect(() => {
    const handleGlobalUp = () => {
      if (isDragging) handlePointerUp();
    };
    const handleGlobalMove = (e) => {
      if (isDragging) handlePointerMove(e);
    };

    if (isDragging) {
      window.addEventListener('mouseup', handleGlobalUp);
      window.addEventListener('touchend', handleGlobalUp);
      window.addEventListener('mousemove', handleGlobalMove);
      window.addEventListener('touchmove', handleGlobalMove);
    }

    return () => {
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchend', handleGlobalUp);
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('touchmove', handleGlobalMove);
    };
  }, [isDragging, sliderVal]);

  const progressStyle = {
    width: `calc(${sliderVal}% + ${sliderVal === 100 ? 0 : 24}px)`,
    transition: isDragging ? 'none' : 'width 0.3s ease-out'
  };

  const thumbStyle = {
    left: `${sliderVal}%`,
    transform: `translateX(-${sliderVal}%)`,
    transition: isDragging ? 'none' : 'all 0.3s ease-out'
  };

  return (
    <div 
      className="relative w-full h-14 bg-red-50 border border-red-200 rounded-xl overflow-hidden select-none touch-none shadow-inner"
      ref={trackRef}
    >
      {/* Background Text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-[13px] font-bold tracking-widest uppercase transition-opacity duration-300 ${sliderVal > 30 ? 'opacity-0' : 'opacity-100 text-red-500'}`}>
          Slide to Cancel Booking
        </span>
      </div>

      {/* Progress Fill */}
      <div 
        className="absolute top-0 left-0 h-full bg-red-500"
        style={progressStyle}
      />

      {/* Confirmed Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className={`text-[13px] font-bold tracking-widest uppercase text-white transition-opacity duration-300 ${sliderVal > 80 || isConfirmed ? 'opacity-100' : 'opacity-0'}`}>
          {isLoading ? 'Cancelling...' : 'Confirmed'}
        </span>
      </div>

      {/* Thumb / Dragger */}
      <div
        className={`absolute top-1 bottom-1 w-12 rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing z-10 ${
          isConfirmed || isLoading ? 'bg-red-700 text-red-200' : 'bg-white shadow-md border border-red-100 text-red-500'
        }`}
        style={thumbStyle}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        {isConfirmed || isLoading ? (
          <CheckCircle2 className="w-5 h-5 animate-pulse" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
      </div>
    </div>
  );
};

export default SlideToCancel;
