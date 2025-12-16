
import React from 'react';
import { Project, HeadshotStyle } from '../types';
import { STYLES } from '../constants';
import { useLanguage } from './LanguageContext';

interface HistoryGalleryProps {
  projects: Project[];
  onSelect: (project: Project) => void;
  onClose: () => void;
  onDelete: (id: number) => void;
}

export const HistoryGallery: React.FC<HistoryGalleryProps> = ({ projects, onSelect, onClose, onDelete }) => {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <h2 className="text-xl font-bold text-slate-900">{t.historyTitle}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 grid grid-cols-2 gap-4">
          {projects.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-slate-400">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              </div>
              <p>{t.noHistory}</p>
              <p className="text-sm mt-2">{t.noHistoryDesc}</p>
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="group relative border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all bg-slate-50">
                <div className="aspect-square relative cursor-pointer" onClick={() => onSelect(project)}>
                  <img src={project.generatedImage} alt="Generated" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold text-slate-700 truncate">{t.styles[project.style]?.title || STYLES[project.style].title}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {new Date(project.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (project.id) onDelete(project.id);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur rounded-full text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all shadow-sm"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
