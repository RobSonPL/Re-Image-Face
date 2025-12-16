
import React, { useState } from 'react';
import { generateHeadshotVideo } from '../services/geminiService';
import { Button } from './Button';
import { useLanguage } from './LanguageContext';

interface VideoGeneratorProps {
  sourceImage: string;
}

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({ sourceImage }) => {
  const { t } = useLanguage();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("Subtle Smile");

  const PRESETS = [
    "Subtle Smile",
    "Slow Zoom In",
    "Wind Blowing Hair",
    "Cinematic Pan",
    "Gentle Nod"
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);

    const prompt = customPrompt.trim() || selectedPreset;

    try {
      const url = await generateHeadshotVideo(sourceImage, prompt);
      setVideoUrl(url);
    } catch (err: any) {
      setError(err.message || "Failed to generate video");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">{t.animateTitle}</h3>
          <p className="text-sm text-slate-500">{t.animateDesc}</p>
        </div>
      </div>

      {!videoUrl ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">{t.animationStyle}</label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => { setSelectedPreset(preset); setCustomPrompt(""); }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors border ${
                    selectedPreset === preset && !customPrompt
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {t.videoPresets?.[preset] || preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <input
              type="text"
              placeholder={t.customPromptPlaceholder}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full px-4 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <Button 
            onClick={handleGenerate} 
            isLoading={isGenerating} 
            className="w-full"
            variant="secondary"
          >
            {isGenerating ? t.generatingVideo : t.generateVideo}
          </Button>
          
          <p className="text-[10px] text-slate-400 text-center">
            {t.requiresPaid}
          </p>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in">
           <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden shadow-lg mx-auto max-w-[200px]">
             <video 
                src={videoUrl} 
                controls 
                autoPlay 
                loop 
                className="w-full h-full object-cover"
             />
           </div>
           
           <div className="flex gap-2">
             <a 
               href={videoUrl} 
               download="headshot-video.mp4"
               className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 text-center transition-colors"
             >
               {t.downloadMp4}
             </a>
             <button 
               onClick={() => setVideoUrl(null)}
               className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
             >
               {t.newPhoto}
             </button>
           </div>
        </div>
      )}
    </div>
  );
};
