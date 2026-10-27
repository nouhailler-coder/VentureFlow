import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  title?: string;
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  title,
  children,
  position = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };
    if (isVisible) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center align-middle ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsVisible((prev) => !prev);
        }}
        className="text-slate-400 hover:text-emerald-500 dark:text-slate-500 dark:hover:text-emerald-400 p-0.5 rounded transition-colors focus:outline-hidden cursor-help inline-flex items-center"
        aria-label={title || 'Aide contextuelle'}
      >
        {children || <HelpCircle className="w-3.5 h-3.5" />}
      </button>

      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 w-64 p-2.5 text-xs rounded-lg shadow-xl backdrop-blur-md pointer-events-auto transition-opacity animate-in fade-in-50 duration-150 ${
            position === 'top'
              ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
              : position === 'bottom'
              ? 'top-full left-1/2 -translate-x-1/2 mt-2'
              : position === 'left'
              ? 'right-full top-1/2 -translate-y-1/2 mr-2'
              : 'left-full top-1/2 -translate-y-1/2 ml-2'
          } bg-slate-900/95 dark:bg-slate-900/95 border border-slate-700/80 dark:border-slate-800 text-slate-100`}
        >
          {title && (
            <div className="font-semibold text-emerald-400 text-[11px] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>{title}</span>
            </div>
          )}
          <div className="text-[11px] text-slate-300 leading-relaxed font-sans">{content}</div>
        </div>
      )}
    </div>
  );
};
