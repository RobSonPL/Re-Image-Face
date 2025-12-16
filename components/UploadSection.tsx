
import React, { useRef } from 'react';
import { useLanguage } from './LanguageContext';

interface UploadSectionProps {
  onImageSelect: (base64: string) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onImageSelect }) => {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      onImageSelect(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div 
      className="w-full max-w-md mx-auto aspect-square md:aspect-[4/5] border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100 hover:border-indigo-400 transition-colors cursor-pointer flex flex-col items-center justify-center p-8 text-center group"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        ref={inputRef}
        className="hidden" 
        accept="image/*"
        onChange={handleFileChange}
      />
      
      <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{t.uploadTitle}</h3>
      <p className="text-sm text-slate-500 mb-4">{t.uploadDesc}</p>
      <span className="text-xs text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">
        {t.uploadFormat}
      </span>
    </div>
  );
};
