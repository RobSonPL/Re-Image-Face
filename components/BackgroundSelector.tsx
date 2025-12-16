
import React from 'react';
import { BackgroundConfig } from '../types';
import { BACKGROUNDS } from '../constants';
import { useLanguage } from './LanguageContext';

interface BackgroundSelectorProps {
  selectedBackgroundId: string;
  onSelect: (id: any) => void;
}

export const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({ selectedBackgroundId, onSelect }) => {
  const { t } = useLanguage();
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-slate-900">{t.backgroundLabel}</label>
        <span className="text-xs text-slate-500">{t.backgroundDesc}</span>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
        {BACKGROUNDS.map((bg) => {
          const isSelected = selectedBackgroundId === bg.id;
          return (
            <button
              key={bg.id}
              onClick={() => onSelect(bg.id)}
              className={`
                relative group flex-shrink-0 w-24 h-20 rounded-xl overflow-hidden border-2 transition-all snap-start
                ${isSelected ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-slate-200 hover:border-indigo-300'}
              `}
            >
              <div className={`w-full h-full ${bg.previewColor}`}>
                  {/* Overlay for text legibility if needed, or simple icon */}
                  {bg.id === 'ORIGINAL' && (
                     <div className="absolute inset-0 flex items-center justify-center opacity-30">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                     </div>
                  )}
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-1.5 border-t border-white/50">
                <p className={`text-[10px] font-bold text-center truncate ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                  {t.backgrounds[bg.id] || bg.label}
                </p>
              </div>

              {isSelected && (
                <div className="absolute top-1 right-1 bg-indigo-600 text-white rounded-full p-0.5">
                   <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
