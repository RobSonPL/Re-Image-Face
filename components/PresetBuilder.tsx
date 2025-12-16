
import React, { useState } from 'react';
import { HeadshotStyle } from '../types';
import { STYLES } from '../constants';
import { useLanguage } from './LanguageContext';

interface PresetBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, styles: HeadshotStyle[]) => void;
}

export const PresetBuilder: React.FC<PresetBuilderProps> = ({ isOpen, onClose, onSave }) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<Set<HeadshotStyle>>(new Set());

  if (!isOpen) return null;

  const toggleStyle = (id: HeadshotStyle) => {
    const newSet = new Set(selectedStyles);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedStyles(newSet);
  };

  const handleSave = () => {
    if (name.trim() && selectedStyles.size > 0) {
      onSave(name, Array.from(selectedStyles));
      setName('');
      setSelectedStyles(new Set());
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">{t.mixTitle}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">{t.mixNameLabel}</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.mixPlaceholder}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          <label className="block text-sm font-semibold text-slate-700 mb-2">{t.selectStylesToBlend}</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.values(STYLES).map((style) => (
              <div 
                key={style.id}
                onClick={() => toggleStyle(style.id)}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedStyles.has(style.id) 
                    ? 'border-indigo-600 bg-indigo-50' 
                    : 'border-slate-200 hover:border-indigo-200'
                }`}
              >
                <div className="flex items-center gap-2">
                   <div className={`w-3 h-3 rounded-full ${style.iconColor.split(' ')[0].replace('text-', 'bg-')}`}></div>
                   <span className="text-sm font-medium text-slate-700">{t.styles[style.id]?.title || style.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
          >
            {t.cancel}
          </button>
          <button 
            onClick={handleSave}
            disabled={!name.trim() || selectedStyles.size < 2}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
          >
            {t.saveMix}
          </button>
        </div>
      </div>
    </div>
  );
};
