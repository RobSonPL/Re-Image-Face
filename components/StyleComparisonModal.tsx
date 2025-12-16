
import React, { useState } from 'react';
import { HeadshotStyle } from '../types';
import { STYLES } from '../constants';
import { useLanguage } from './LanguageContext';

interface StyleComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalImage: string | null;
  previews: Record<string, string>;
  previewLoading: Record<string, boolean>;
  onGeneratePreviews: (styleIds: HeadshotStyle[]) => void;
  onSelectStyle: (style: HeadshotStyle) => void;
}

export const StyleComparisonModal: React.FC<StyleComparisonModalProps> = ({
  isOpen,
  onClose,
  originalImage,
  previews,
  previewLoading,
  onGeneratePreviews,
  onSelectStyle
}) => {
  const { t } = useLanguage();
  const [selectedForCompare, setSelectedForCompare] = useState<Set<HeadshotStyle>>(new Set());

  if (!isOpen) return null;

  const toggleStyle = (id: HeadshotStyle) => {
    const newSet = new Set(selectedForCompare);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedForCompare(newSet);
  };

  const handleGenerateClick = () => {
    // Only generate for those that don't have previews yet
    const toGenerate = Array.from(selectedForCompare).filter(id => !previews[id as string]);
    if (toGenerate.length > 0) {
      onGeneratePreviews(toGenerate);
    }
  };

  const selectAll = () => {
    setSelectedForCompare(new Set(Object.values(HeadshotStyle)));
  };

  const clearSelection = () => {
    setSelectedForCompare(new Set());
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t.compareTitle}</h2>
            <p className="text-slate-500 text-sm">{t.compareDesc}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-4 items-center justify-between shrink-0">
          <div className="flex gap-2">
            <button onClick={selectAll} className="text-xs font-medium text-slate-600 hover:text-indigo-600 px-3 py-1.5 bg-white border border-slate-200 rounded-lg transition-colors">{t.selectAll}</button>
            <button onClick={clearSelection} className="text-xs font-medium text-slate-600 hover:text-red-600 px-3 py-1.5 bg-white border border-slate-200 rounded-lg transition-colors">{t.clear}</button>
            <span className="text-xs text-slate-400 flex items-center ml-2">{selectedForCompare.size} {t.selected}</span>
          </div>
          
          <button 
            onClick={handleGenerateClick}
            disabled={selectedForCompare.size === 0 || !originalImage}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
          >
            {t.generatePreviews} ({Array.from(selectedForCompare).filter(id => !previews[id as string]).length} new)
          </button>
        </div>

        {/* Content - Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Object.values(STYLES).map((style) => {
              const isSelected = selectedForCompare.has(style.id);
              const hasPreview = !!previews[style.id];
              const isLoading = !!previewLoading[style.id];
              const title = t.styles[style.id]?.title || style.title;
              const desc = t.styles[style.id]?.desc || style.description;

              return (
                <div 
                  key={style.id}
                  onClick={() => toggleStyle(style.id)}
                  className={`
                    relative group rounded-xl border-2 overflow-hidden transition-all cursor-pointer bg-white
                    ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-indigo-200'}
                  `}
                >
                  {/* Selection Checkbox */}
                  <div className={`absolute top-2 left-2 z-10 w-5 h-5 rounded border bg-white flex items-center justify-center transition-colors ${isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300 text-transparent'}`}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>

                  {/* Image Area */}
                  <div className="aspect-square bg-slate-100 relative">
                    {hasPreview ? (
                      <img src={previews[style.id]} alt={title} className="w-full h-full object-cover animate-in fade-in" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                        {isLoading ? (
                          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                        ) : (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 opacity-50 ${style.iconColor}`}>
                             {/* Placeholder Icon dot */}
                             <div className="w-4 h-4 rounded-full bg-current opacity-50"></div>
                          </div>
                        )}
                        <span className="text-xs">{isLoading ? 'Generating...' : t.noPreview}</span>
                      </div>
                    )}
                    
                    {/* Hover Action */}
                    {hasPreview && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             onSelectStyle(style.id);
                             onClose();
                           }}
                           className="bg-white text-indigo-600 px-4 py-2 rounded-full font-bold text-xs shadow-lg transform scale-90 group-hover:scale-100 transition-transform"
                         >
                           {t.selectThisStyle}
                         </button>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-3">
                    <h3 className="font-bold text-xs text-slate-900 truncate">{title}</h3>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
